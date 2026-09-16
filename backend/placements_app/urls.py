from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, CompanyViewSet, PlacementViewSet, DashboardStatsView

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'placements', PlacementViewSet, basename='placement')

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('', include(router.urls)),
]
