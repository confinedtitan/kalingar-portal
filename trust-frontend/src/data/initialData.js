export const initialMembers = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    phone: '9876543210',
    email: 'rajesh@email.com',
    dob: '1975-05-15',
    address: '123 Temple Street, Chennai',
    fatherName: 'Venkatesh Kumar',
    motherName: 'Lakshmi Kumar',
    spouseName: 'Priya Rajesh',
    children: [
      { name: 'Arjun Rajesh', dob: '2005-08-20', gender: 'Male' },
      { name: 'Anjali Rajesh', dob: '2008-03-12', gender: 'Female' }
    ],
    password: 'member123',
    annualTax: 25000,
    amountPaid: 15000,
    amountDue: 10000
  },
  {
    id: 2,
    name: 'Suresh Babu',
    phone: '9876543211',
    email: 'suresh@email.com',
    dob: '1980-11-23',
    address: '456 Gandhi Road, Chennai',
    fatherName: 'Ramesh Babu',
    motherName: 'Saraswathi Babu',
    spouseName: 'Meena Suresh',
    children: [
      { name: 'Karthik Suresh', dob: '2010-06-15', gender: 'Male' }
    ],
    password: 'member123',
    annualTax: 20000,
    amountPaid: 20000,
    amountDue: 0
  }
];

export const initialPayments = [
  {
    id: 1,
    memberId: 1,
    memberName: 'Rajesh Kumar',
    amount: 15000,
    date: '2024-01-15',
    method: 'UPI',
    reference: 'TXN123456',
    status: 'completed'
  },
  {
    id: 2,
    memberId: 2,
    memberName: 'Suresh Babu',
    amount: 20000,
    date: '2024-02-10',
    method: 'Bank Transfer',
    reference: 'TXN123457',
    status: 'completed'
  }
];
