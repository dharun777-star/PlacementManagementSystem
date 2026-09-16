from django.shortcuts import render
from django.views.generic import TemplateView
from django.db.models import Count, Avg, Max, Q
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action

from .models import Student, Company, Placement
from .serializers import StudentSerializer, CompanySerializer, PlacementSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Student CRUD operations.
    Supports search by name, department, or student ID via query param ?search=
    or direct filter ?department=
    """
    queryset = Student.objects.all().order_by('-created_at')
    serializer_class = StudentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'student_id', 'department', 'skills']
    ordering_fields = ['name', 'student_id', 'department', 'year', 'cgpa', 'placement_status', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        department = self.request.query_params.get('department')
        status_param = self.request.query_params.get('placement_status')
        search_param = self.request.query_params.get('search')

        if department:
            qs = qs.filter(department__iexact=department)
        if status_param:
            qs = qs.filter(placement_status__iexact=status_param)
        if search_param:
            qs = qs.filter(
                Q(name__icontains=search_param) |
                Q(student_id__icontains=search_param) |
                Q(department__icontains=search_param) |
                Q(skills__icontains=search_param)
            )
        return qs


class CompanyViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Company CRUD operations.
    Supports search by company name, job role, or location.
    """
    queryset = Company.objects.all().order_by('-drive_date', '-created_at')
    serializer_class = CompanySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['company_name', 'company_id', 'job_role', 'location', 'required_skills']
    ordering_fields = ['company_name', 'package', 'drive_date', 'location']

    def get_queryset(self):
        qs = super().get_queryset()
        search_param = self.request.query_params.get('search')
        if search_param:
            qs = qs.filter(
                Q(company_name__icontains=search_param) |
                Q(company_id__icontains=search_param) |
                Q(job_role__icontains=search_param) |
                Q(location__icontains=search_param)
            )
        return qs


class PlacementViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Placement CRUD operations.
    Supports filtering by company and placement status.
    """
    queryset = Placement.objects.select_related('student', 'company').all().order_by('-placement_date', '-created_at')
    serializer_class = PlacementSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['placement_id', 'student__name', 'student__student_id', 'company__company_name', 'job_role']
    ordering_fields = ['placement_date', 'package', 'status', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        company_id = self.request.query_params.get('company')
        status_param = self.request.query_params.get('status')
        search_param = self.request.query_params.get('search')

        if company_id:
            qs = qs.filter(company_id=company_id)
        if status_param:
            qs = qs.filter(status__iexact=status_param)
        if search_param:
            qs = qs.filter(
                Q(placement_id__icontains=search_param) |
                Q(student__name__icontains=search_param) |
                Q(student__student_id__icontains=search_param) |
                Q(company__company_name__icontains=search_param) |
                Q(job_role__icontains=search_param)
            )
        return qs


class DashboardStatsView(APIView):
    """
    Returns aggregated metrics and statistics for the Placement Dashboard.
    """
    def get(self, request):
        total_students = Student.objects.count()
        total_companies = Company.objects.count()
        placed_students = Student.objects.filter(placement_status='Placed').count()
        not_placed_students = Student.objects.filter(placement_status='Not Placed').count()
        total_placements = Placement.objects.count()

        placement_rate = 0.0
        if total_students > 0:
            placement_rate = round((placed_students / total_students) * 100, 1)

        placement_agg = Placement.objects.aggregate(
            avg_pkg=Avg('package'),
            max_pkg=Max('package')
        )
        avg_package = round(float(placement_agg['avg_pkg'] or 0.0), 2)
        highest_package = round(float(placement_agg['max_pkg'] or 0.0), 2)

        # Department wise breakdown
        dept_breakdown = list(
            Student.objects.values('department').annotate(
                total=Count('id'),
                placed=Count('id', filter=Q(placement_status='Placed'))
            ).order_by('department')
        )

        # Recent placements
        recent_placements = PlacementSerializer(
            Placement.objects.select_related('student', 'company').all().order_by('-placement_date', '-created_at')[:5],
            many=True
        ).data

        # Top hiring companies
        top_companies = list(
            Placement.objects.values('company__company_name').annotate(
                hires=Count('id')
            ).order_by('-hires')[:5]
        )

        return Response({
            'total_students': total_students,
            'total_companies': total_companies,
            'placed_students': placed_students,
            'not_placed_students': not_placed_students,
            'total_placements': total_placements,
            'placement_rate': placement_rate,
            'avg_package': avg_package,
            'highest_package': highest_package,
            'dept_breakdown': dept_breakdown,
            'top_companies': top_companies,
            'recent_placements': recent_placements,
        }, status=status.HTTP_200_OK)


class FrontendAppView(TemplateView):
    """
    Serves the SPA frontend dashboard HTML.
    """
    template_name = 'index.html'
