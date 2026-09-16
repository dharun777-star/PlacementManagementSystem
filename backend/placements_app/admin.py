from django.contrib import admin
from .models import Student, Company, Placement


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'name', 'email', 'phone', 'department', 'year', 'cgpa', 'placement_status')
    search_fields = ('student_id', 'name', 'email', 'department')
    list_filter = ('department', 'year', 'placement_status')


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('company_id', 'company_name', 'job_role', 'package', 'location', 'drive_date')
    search_fields = ('company_id', 'company_name', 'job_role', 'location')
    list_filter = ('job_role', 'location')


@admin.register(Placement)
class PlacementAdmin(admin.ModelAdmin):
    list_display = ('placement_id', 'student', 'company', 'job_role', 'package', 'placement_date', 'status')
    search_fields = ('placement_id', 'student__name', 'student__student_id', 'company__company_name')
    list_filter = ('status', 'placement_date')

