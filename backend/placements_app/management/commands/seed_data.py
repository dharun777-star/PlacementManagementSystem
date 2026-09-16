from datetime import date
from django.core.management.base import BaseCommand
from placements_app.models import Student, Company, Placement


class Command(BaseCommand):
    help = 'Seeds database with realistic sample students, companies, and placement drives.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Clearing existing records...'))
        Placement.objects.all().delete()
        Student.objects.all().delete()
        Company.objects.all().delete()

        self.stdout.write(self.style.NOTICE('Creating sample students...'))
        students_data = [
            {
                'student_id': 'STU202601',
                'name': 'Aarav Sharma',
                'email': 'aarav.sharma@college.edu',
                'phone': '9876543210',
                'department': 'CSE',
                'year': 4,
                'cgpa': 9.25,
                'skills': 'Python, Django, React, Docker, Machine Learning',
                'placement_status': 'Not Placed'
            },
            {
                'student_id': 'STU202602',
                'name': 'Priya Patel',
                'email': 'priya.patel@college.edu',
                'phone': '9876543211',
                'department': 'IT',
                'year': 4,
                'cgpa': 8.80,
                'skills': 'Java, Spring Boot, SQL, AWS, Microservices',
                'placement_status': 'Not Placed'
            },
            {
                'student_id': 'STU202603',
                'name': 'Rohan Iyer',
                'email': 'rohan.iyer@college.edu',
                'phone': '9876543212',
                'department': 'ECE',
                'year': 4,
                'cgpa': 8.40,
                'skills': 'C++, Embedded Systems, IoT, Python, Verilog',
                'placement_status': 'Not Placed'
            },
            {
                'student_id': 'STU202604',
                'name': 'Ananya Sen',
                'email': 'ananya.sen@college.edu',
                'phone': '9876543213',
                'department': 'CSE',
                'year': 4,
                'cgpa': 9.60,
                'skills': 'Algorithms, C++, Golang, Distributed Systems, Kubernetes',
                'placement_status': 'Not Placed'
            },
            {
                'student_id': 'STU202605',
                'name': 'Vikram Verma',
                'email': 'vikram.verma@college.edu',
                'phone': '9876543214',
                'department': 'MECH',
                'year': 4,
                'cgpa': 7.95,
                'skills': 'AutoCAD, SolidWorks, Python, Data Analysis, MATLAB',
                'placement_status': 'Not Placed'
            },
            {
                'student_id': 'STU202606',
                'name': 'Kavya Nair',
                'email': 'kavya.nair@college.edu',
                'phone': '9876543215',
                'department': 'AIDS',
                'year': 4,
                'cgpa': 9.10,
                'skills': 'Python, PyTorch, NLP, Computer Vision, Pandas',
                'placement_status': 'Not Placed'
            },
            {
                'student_id': 'STU202607',
                'name': 'Siddharth Rao',
                'email': 'siddharth.rao@college.edu',
                'phone': '9876543216',
                'department': 'EEE',
                'year': 4,
                'cgpa': 8.15,
                'skills': 'Power Systems, MATLAB, C++, Circuit Simulation',
                'placement_status': 'Not Placed'
            },
            {
                'student_id': 'STU202608',
                'name': 'Sneha Gupta',
                'email': 'sneha.gupta@college.edu',
                'phone': '9876543217',
                'department': 'IT',
                'year': 4,
                'cgpa': 8.65,
                'skills': 'JavaScript, Node.js, React, MongoDB, Express',
                'placement_status': 'Not Placed'
            },
        ]

        created_students = {}
        for s_data in students_data:
            s = Student.objects.create(**s_data)
            created_students[s.student_id] = s

        self.stdout.write(self.style.NOTICE('Creating sample companies...'))
        companies_data = [
            {
                'company_id': 'COMP101',
                'company_name': 'Google India',
                'hr_name': 'Meera Sundaram',
                'hr_email': 'meera.s@google.com',
                'job_role': 'Software Development Engineer',
                'package': 28.50,
                'location': 'Bangalore',
                'required_skills': 'Data Structures, Algorithms, System Design, C++/Java/Python',
                'drive_date': date(2026, 10, 15)
            },
            {
                'company_id': 'COMP102',
                'company_name': 'Microsoft',
                'hr_name': 'David Miller',
                'hr_email': 'dmiller@microsoft.com',
                'job_role': 'Cloud Solutions Engineer',
                'package': 22.00,
                'location': 'Hyderabad',
                'required_skills': 'Azure, Cloud Architecture, C#, Python, Linux',
                'drive_date': date(2026, 10, 20)
            },
            {
                'company_id': 'COMP103',
                'company_name': 'Amazon Web Services',
                'hr_name': 'Rajesh Khanna',
                'hr_email': 'rkhanna@amazon.com',
                'job_role': 'Data Scientist',
                'package': 19.50,
                'location': 'Bangalore',
                'required_skills': 'Machine Learning, PyTorch, SQL, Statistics, AWS SageMaker',
                'drive_date': date(2026, 11, 2)
            },
            {
                'company_id': 'COMP104',
                'company_name': 'Tata Consultancy Services',
                'hr_name': 'Sunita Deshmukh',
                'hr_email': 'sunita.d@tcs.com',
                'job_role': 'Systems Associate',
                'package': 7.50,
                'location': 'Pune',
                'required_skills': 'Java, SQL, Web Development, Problem Solving',
                'drive_date': date(2026, 9, 28)
            },
            {
                'company_id': 'COMP105',
                'company_name': 'Infosys',
                'hr_name': 'Arjun Menon',
                'hr_email': 'arjun.menon@infosys.com',
                'job_role': 'Specialist Programmer',
                'package': 9.50,
                'location': 'Chennai',
                'required_skills': 'Full Stack Development, React, Spring Boot, Databases',
                'drive_date': date(2026, 10, 5)
            },
        ]

        created_companies = {}
        for c_data in companies_data:
            c = Company.objects.create(**c_data)
            created_companies[c.company_id] = c

        self.stdout.write(self.style.NOTICE('Creating sample placements...'))
        placements_data = [
            {
                'placement_id': 'PLC001',
                'student': created_students['STU202604'],
                'company': created_companies['COMP101'],
                'job_role': 'Software Development Engineer',
                'package': 28.50,
                'placement_date': date(2026, 9, 10),
                'status': 'Selected'
            },
            {
                'placement_id': 'PLC002',
                'student': created_students['STU202601'],
                'company': created_companies['COMP102'],
                'job_role': 'Cloud Solutions Engineer',
                'package': 22.00,
                'placement_date': date(2026, 9, 12),
                'status': 'Offered'
            },
            {
                'placement_id': 'PLC003',
                'student': created_students['STU202606'],
                'company': created_companies['COMP103'],
                'job_role': 'Data Scientist',
                'package': 19.50,
                'placement_date': date(2026, 9, 14),
                'status': 'Selected'
            },
            {
                'placement_id': 'PLC004',
                'student': created_students['STU202602'],
                'company': created_companies['COMP105'],
                'job_role': 'Specialist Programmer',
                'package': 9.50,
                'placement_date': date(2026, 9, 8),
                'status': 'Joined'
            },
            {
                'placement_id': 'PLC005',
                'student': created_students['STU202608'],
                'company': created_companies['COMP104'],
                'job_role': 'Systems Associate',
                'package': 7.50,
                'placement_date': date(2026, 9, 5),
                'status': 'Offered'
            },
        ]

        for p_data in placements_data:
            Placement.objects.create(**p_data)

        self.stdout.write(self.style.SUCCESS(
            f'Successfully seeded database: {Student.objects.count()} students, '
            f'{Company.objects.count()} companies, and {Placement.objects.count()} placements!'
        ))
