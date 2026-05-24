from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.forms import PasswordResetForm
from django.core.exceptions import ValidationError
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from urllib.parse import urlencode
from django.core.mail import send_mail
from django.conf import settings
import logging
from .serializers import RegisterSerializer, UserProfileSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class PublicProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]
    lookup_field = 'username'


class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'email': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

        form = PasswordResetForm(data={'email': email})
        if form.is_valid():
            users = form.get_users(email)
            frontend_url = getattr(settings, 'FRONTEND_URL', None)
            if not frontend_url:
                if settings.DEBUG:
                    frontend_url = request.build_absolute_uri('/').rstrip('/')
                else:
                    return Response(
                        {'detail': 'Password reset is unavailable because FRONTEND_URL is not configured.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            for user in users:
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                # URL-encode query params to avoid link truncation or invalid characters
                query = urlencode({'uid': uid, 'token': token})
                reset_link = f"{frontend_url}/reset-password/confirm?{query}"
                subject = 'Reset your IdeaValidator password'
                message = (
                    f'Hi {user.username},\n\n'
                    'You requested a password reset for your IdeaValidator account.\n\n'
                    f'Click the link below to reset your password:\n\n{reset_link}\n\n'
                    'If you did not request this, you can ignore this email.\n\n'
                    'Thanks,\nIdeaValidator Team'
                )
                try:
                    send_mail(subject, message, getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@localhost'), [user.email], fail_silently=False)
                except Exception as exc:
                    logging.getLogger(__name__).exception('Failed to send password reset email')
                    # In DEBUG mode, print the reset link so developers can use it without SMTP
                    if settings.DEBUG:
                        print('Password reset email failed to send. Message content:')
                        print(message)

        return Response(
            {'detail': 'If an account exists for that email, password reset instructions have been sent.'},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        new_password2 = request.data.get('new_password2')

        if not uid or not token or not new_password or not new_password2:
            return Response({'detail': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != new_password2:
            return Response({'new_password2': ['Passwords do not match.']}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except ValidationError as exc:
            return Response({'new_password': list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
