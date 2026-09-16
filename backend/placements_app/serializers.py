import re
from rest_framework import serializers
from .models import Student, Company, Placement


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id', 'student_id', 'name', 'email', 'phone',
            'department', 'year', 'cgpa', 'skills',
            'placement_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_student_id(self, value):
        val = value.strip().upper()
        if not val:
            raise serializers.ValidationError("Student ID cannot be empty.")
        # Check uniqueness on update vs create
        instance = getattr(self, 'instance', None)
        qs = Student.objects.filter(student_id__iexact=val)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A student with this Student ID already exists.")
        return val

    def validate_email(self, value):
        val = value.strip().lower()
        instance = getattr(self, 'instance', None)
        qs = Student.objects.filter(email__iexact=val)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A student with this Email already exists.")
        return val

    def validate_phone(self, value):
        val = re.sub(r'[\s\-\(\)\+]', '', value)
        if not val.isdigit() or len(val) < 10 or len(val) > 15:
            raise serializers.ValidationError("Phone number must contain between 10 and 15 digits.")
        return value.strip()

    def validate_cgpa(self, value):
        if value is None:
            raise serializers.ValidationError("CGPA is required.")
        if value < 0 or value > 10:
            raise serializers.ValidationError("CGPA must be between 0.00 and 10.00.")
        return round(value, 2)


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'id', 'company_id', 'company_name', 'hr_name',
            'hr_email', 'job_role', 'package', 'location',
            'required_skills', 'drive_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_company_id(self, value):
        val = value.strip().upper()
        if not val:
            raise serializers.ValidationError("Company ID cannot be empty.")
        instance = getattr(self, 'instance', None)
        qs = Company.objects.filter(company_id__iexact=val)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A company with this Company ID already exists.")
        return val

    def validate_package(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Package must be a positive number greater than 0.")
        return round(value, 2)


class PlacementSerializer(serializers.ModelSerializer):
    # Expanded read-only fields for convenient display in frontend
    student_details = StudentSerializer(source='student', read_only=True)
    company_details = CompanySerializer(source='company', read_only=True)
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_roll = serializers.CharField(source='student.student_id', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True)

    class Meta:
        model = Placement
        fields = [
            'id', 'placement_id', 'student', 'company',
            'student_details', 'company_details', 'student_name', 'student_roll', 'company_name',
            'job_role', 'package', 'placement_date', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_placement_id(self, value):
        val = value.strip().upper()
        if not val:
            raise serializers.ValidationError("Placement ID cannot be empty.")
        instance = getattr(self, 'instance', None)
        qs = Placement.objects.filter(placement_id__iexact=val)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A placement record with this ID already exists.")
        return val

    def validate_package(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Package must be greater than 0.")
        return round(value, 2)
