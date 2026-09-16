from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Student, Company, Placement


class StudentAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = Student.objects.create(
            student_id='STU001',
            name='Test Student',
            email='test@college.edu',
            phone='9876543210',
            department='CSE',
            year=4,
            cgpa=8.5,
            skills='Python, Django',
            placement_status='Not Placed'
        )

    def test_list_students(self):
        response = self.client.get('/api/students/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_single_student(self):
        response = self.client.get(f'/api/students/{self.student.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['student_id'], 'STU001')

    def test_create_valid_student(self):
        data = {
            'student_id': 'STU002',
            'name': 'Second Student',
            'email': 'second@college.edu',
            'phone': '9123456789',
            'department': 'IT',
            'year': 3,
            'cgpa': 9.1,
            'skills': 'Java, React',
            'placement_status': 'Not Placed'
        }
        response = self.client.post('/api/students/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Student.objects.count(), 2)

    def test_create_student_duplicate_id(self):
        data = {
            'student_id': 'STU001', # duplicate
            'name': 'Duplicate ID',
            'email': 'another@college.edu',
            'phone': '9876543210',
            'department': 'CSE',
            'year': 4,
            'cgpa': 7.5,
            'skills': 'C++',
            'placement_status': 'Not Placed'
        }
        response = self.client.post('/api/students/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('student_id', response.data)

    def test_create_student_duplicate_email(self):
        data = {
            'student_id': 'STU999',
            'name': 'Duplicate Email',
            'email': 'test@college.edu', # duplicate
            'phone': '9876543210',
            'department': 'ECE',
            'year': 4,
            'cgpa': 7.5,
            'skills': 'C++',
            'placement_status': 'Not Placed'
        }
        response = self.client.post('/api/students/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_create_student_invalid_cgpa(self):
        data = {
            'student_id': 'STU003',
            'name': 'Invalid CGPA',
            'email': 'cgpa@college.edu',
            'phone': '9876543210',
            'department': 'CSE',
            'year': 4,
            'cgpa': 11.5, # > 10
            'skills': 'Python',
            'placement_status': 'Not Placed'
        }
        response = self.client.post('/api/students/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cgpa', response.data)

    def test_update_student(self):
        update_data = {
            'name': 'Updated Name',
            'cgpa': 9.0
        }
        response = self.client.patch(f'/api/students/{self.student.id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.name, 'Updated Name')
        self.assertEqual(float(self.student.cgpa), 9.0)

    def test_delete_student(self):
        response = self.client.delete(f'/api/students/{self.student.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Student.objects.count(), 0)


class CompanyAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.company = Company.objects.create(
            company_id='COMP01',
            company_name='TechCorp',
            hr_name='Jane Doe',
            hr_email='jane@techcorp.com',
            job_role='Software Engineer',
            package=12.0,
            location='Bangalore',
            required_skills='Python, SQL',
            drive_date='2026-10-15'
        )

    def test_list_companies(self):
        response = self.client.get('/api/companies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_valid_company(self):
        data = {
            'company_id': 'COMP02',
            'company_name': 'InnoTech',
            'hr_name': 'John Smith',
            'hr_email': 'john@innotech.com',
            'job_role': 'Frontend Developer',
            'package': 10.5,
            'location': 'Chennai',
            'required_skills': 'React, CSS',
            'drive_date': '2026-11-01'
        }
        response = self.client.post('/api/companies/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Company.objects.count(), 2)

    def test_create_company_negative_package(self):
        data = {
            'company_id': 'COMP03',
            'company_name': 'BadPackage',
            'hr_name': 'John Smith',
            'hr_email': 'john@bad.com',
            'job_role': 'Tester',
            'package': -5.0, # invalid
            'location': 'Pune',
            'required_skills': 'QA',
            'drive_date': '2026-11-01'
        }
        response = self.client.post('/api/companies/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('package', response.data)

    def test_delete_company(self):
        response = self.client.delete(f'/api/companies/{self.company.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Company.objects.count(), 0)


class PlacementAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = Student.objects.create(
            student_id='STU010',
            name='Alice',
            email='alice@college.edu',
            phone='9876543210',
            department='CSE',
            year=4,
            cgpa=9.0,
            placement_status='Not Placed'
        )
        self.company = Company.objects.create(
            company_id='COMP10',
            company_name='Alpha Tech',
            hr_name='Bob HR',
            hr_email='bob@alphatech.com',
            job_role='Backend Developer',
            package=15.0,
            location='Hyderabad',
            drive_date='2026-10-01'
        )

    def test_create_placement_and_sync_status(self):
        data = {
            'placement_id': 'PLC100',
            'student': self.student.id,
            'company': self.company.id,
            'job_role': 'Backend Developer',
            'package': 15.0,
            'placement_date': '2026-09-15',
            'status': 'Selected'
        }
        response = self.client.post('/api/placements/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.student.refresh_from_db()
        self.assertEqual(self.student.placement_status, 'Placed')

    def test_delete_placement_reverts_status(self):
        placement = Placement.objects.create(
            placement_id='PLC101',
            student=self.student,
            company=self.company,
            job_role='Backend Developer',
            package=15.0,
            placement_date='2026-09-15',
            status='Selected'
        )
        self.student.refresh_from_db()
        self.assertEqual(self.student.placement_status, 'Placed')

        # Delete placement
        response = self.client.delete(f'/api/placements/{placement.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.student.refresh_from_db()
        self.assertEqual(self.student.placement_status, 'Not Placed')

    def test_dashboard_stats_api(self):
        Placement.objects.create(
            placement_id='PLC102',
            student=self.student,
            company=self.company,
            job_role='Backend Developer',
            package=15.0,
            placement_date='2026-09-15',
            status='Selected'
        )
        response = self.client.get('/api/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_students'], 1)
        self.assertEqual(response.data['total_companies'], 1)
        self.assertEqual(response.data['placed_students'], 1)
        self.assertEqual(response.data['not_placed_students'], 0)
        self.assertEqual(response.data['placement_rate'], 100.0)
        self.assertEqual(response.data['avg_package'], 15.0)
