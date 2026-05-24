from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.core.mail import send_mail
import logging
from urllib.parse import urlencode

User = get_user_model()

class Command(BaseCommand):
    help = 'Send a test password reset email to the given address (prints to console if using console backend).'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, required=True, help='Email address to send the test reset link to')

    def handle(self, *args, **options):
        email = options['email']
        try:
            users = User.objects.filter(email__iexact=email)
        except Exception as e:
            raise CommandError(f'Error querying users: {e}')

        if not users.exists():
            self.stdout.write(self.style.WARNING('No user found with that email; a reset email will still be generated for demonstration.'))

        # Create a fake user object for link generation if none exists
        user = users.first() if users.exists() else None
        if not user:
            # Create a temporary unsaved user-like object with required attributes
            class Dummy:
                def __init__(self, email):
                    self.pk = 1
                    self.username = email
                    self.email = email
                    self.last_login = None
                    self.is_active = True
                    self.password = ''
                def get_email_field_name(self):
                    return 'email'
            user = Dummy(email)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = getattr(settings, 'FRONTEND_URL', None) or 'http://localhost:5173'
        # URL-encode query params to avoid truncation or invalid characters in emails
        query = urlencode({'uid': uid, 'token': token})
        reset_link = f"{frontend_url}/reset-password/confirm?{query}"

        subject = 'Test: Reset your IdeaValidator password'
        message = (
            f'Hi {getattr(user, "username", email)},\n\n'
            'This is a test password reset email for IdeaValidator.\n\n'
            f'Use the link below to reset your password:\n\n{reset_link}\n\n'
            'If you did not expect this, ignore it.\n\n'
            'Thanks,\nIdeaValidator Team'
        )

        logger = logging.getLogger(__name__)
        try:
            send_mail(subject, message, getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@localhost'), [email], fail_silently=False)
            self.stdout.write(self.style.SUCCESS(f'Test reset email sent to: {email}'))
        except Exception as e:
            # Log and fall back to printing the message so devs can still use the reset link
            logger.exception('Failed to send test email via SMTP')
            self.stdout.write(self.style.WARNING(f'Failed to send test email via SMTP: {e}'))
            self.stdout.write('--- Test reset email (fallback output) ---')
            self.stdout.write(f'To: {email}')
            self.stdout.write(f'Subject: {subject}')
            self.stdout.write('')
            self.stdout.write(message)
            self.stdout.write('--- End test reset email ---')
            self.stdout.write(self.style.SUCCESS(f'Printed reset email content to console for: {email}'))
