from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='vote_type',
            field=models.CharField(choices=[('up', 'Upvote'), ('down', 'Downvote')], max_length=4, blank=True, null=True),
        ),
    ]
