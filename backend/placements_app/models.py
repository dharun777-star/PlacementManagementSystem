from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Student(models.Model):
    STATUS_CHOICES = [
        ('Placed', 'Placed'),
        ('Not Placed', 'Not Placed'),
    ]

    YEAR_CHOICES = [
        (1, '1st Year'),
        (2, '2nd Year'),
        (3, '3rd Year'),
        (4, '4th Year'),
    ]

    student_id = models.CharField(
        max_length=20,
        unique=True,
        help_text="Unique roll number or student ID (e.g. STU202601)"
    )
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    department = models.CharField(max_length=50)
    year = models.IntegerField(choices=YEAR_CHOICES, default=4)
    cgpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal('0.00'), message="CGPA cannot be less than 0.00"),
            MaxValueValidator(Decimal('10.00'), message="CGPA cannot exceed 10.00")
        ]
    )
    skills = models.TextField(blank=True, help_text="Comma-separated skills (e.g. Python, Django, React)")
    placement_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Not Placed'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student_id} - {self.name} ({self.department})"


class Company(models.Model):
    company_id = models.CharField(
        max_length=20,
        unique=True,
        help_text="Unique company code (e.g. COMP101)"
    )
    company_name = models.CharField(max_length=120)
    hr_name = models.CharField(max_length=100)
    hr_email = models.EmailField()
    job_role = models.CharField(max_length=100)
    package = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'), message="Package must be greater than 0")],
        help_text="Package in LPA (Lakhs Per Annum)"
    )
    location = models.CharField(max_length=100)
    required_skills = models.TextField(blank=True)
    drive_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['-drive_date', '-created_at']

    def __str__(self):
        return f"{self.company_name} - {self.job_role} ({self.package} LPA)"


class Placement(models.Model):
    STATUS_CHOICES = [
        ('Selected', 'Selected'),
        ('Offered', 'Offered'),
        ('Joined', 'Joined'),
        ('Pending', 'Pending'),
    ]

    placement_id = models.CharField(
        max_length=20,
        unique=True,
        help_text="Unique placement record ID (e.g. PLC001)"
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='placements'
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='placements'
    )
    job_role = models.CharField(max_length=100)
    package = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'), message="Package must be greater than 0")]
    )
    placement_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Selected'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-placement_date', '-created_at']

    def __str__(self):
        return f"{self.placement_id}: {self.student.name} @ {self.company.company_name} ({self.status})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Automatically synchronize student placement status
        if self.status in ['Selected', 'Offered', 'Joined']:
            if self.student.placement_status != 'Placed':
                self.student.placement_status = 'Placed'
                self.student.save(update_fields=['placement_status'])

    def delete(self, *args, **kwargs):
        student = self.student
        super().delete(*args, **kwargs)
        # Check if student has other active placements
        active_exists = student.placements.filter(status__in=['Selected', 'Offered', 'Joined']).exists()
        if not active_exists and student.placement_status != 'Not Placed':
            student.placement_status = 'Not Placed'
            student.save(update_fields=['placement_status'])

