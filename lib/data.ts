// Dummy data for the UPI payment app

// Users
export const users = [
  {
    id: "user1",
    name: "Shaun",
    upiId: "shaun@okbank",
    riskScore: 25, // 0-100, lower is better
  },
  {
    id: "user2",
    name: "Ravi",
    upiId: "ravi@okbank",
    riskScore: 72,
  },
  {
    id: "user3",
    name: "Priya",
    upiId: "priya@yesbank",
    riskScore: 45,
  },
  {
    id: "user4",
    name: "Amit",
    upiId: "amit@sbibank",
    riskScore: 30,
  },
  {
    id: "user5",
    name: "Online Store XYZ",
    upiId: "store@xyzbank",
    riskScore: 65,
  },
]

// Contacts (for send money page)
export const contacts = [
  {
    name: "Ravi",
    upiId: "ravi@okbank",
    riskScore: 72,
  },
  {
    name: "Priya",
    upiId: "priya@yesbank",
    riskScore: 45,
  },
  {
    name: "Amit",
    upiId: "amit@sbibank",
    riskScore: 30,
  },
  {
    name: "Online Store XYZ",
    upiId: "store@xyzbank",
    riskScore: 65,
  },
  {
    name: "Coffee Shop",
    upiId: "coffee@axisbank",
    riskScore: 20,
  },
  {
    name: "Grocery Mart",
    upiId: "grocery@hdfcbank",
    riskScore: 15,
  },
  {
    name: "Neha",
    upiId: "neha@icicibank",
    riskScore: 25,
  },
  {
    name: "Rahul",
    upiId: "rahul@hdfcbank",
    riskScore: 35,
  },
  {
    name: "Sanjay",
    upiId: "sanjay@yesbank",
    riskScore: 40,
  },
  {
    name: "Meera",
    upiId: "meera@axisbank",
    riskScore: 28,
  },
]

// Transactions
export const transactions = [
  {
    id: "tx1",
    sender: "Shaun",
    receiver: "Ravi",
    amount: 1500,
    time: "Today, 10:12 AM",
    method: "Manual",
    status: "Suspicious",
    fraudType: "Phishing",
    riskScore: 75,
    reason: "Phishing URL detected",
  },
  {
    id: "tx2",
    sender: "Shaun",
    receiver: "Coffee Shop",
    amount: 120,
    time: "Today, 09:30 AM",
    method: "QR",
    status: "Success",
    riskScore: 15,
  },
  {
    id: "tx3",
    sender: "Shaun",
    receiver: "Online Store XYZ",
    amount: 2499,
    time: "Yesterday, 06:45 PM",
    method: "Link",
    status: "Blocked",
    fraudType: "Anomaly",
    riskScore: 85,
    reason: "Unusual transaction pattern",
  },
  {
    id: "tx4",
    sender: "Priya",
    receiver: "Shaun",
    amount: 500,
    time: "Yesterday, 02:30 PM",
    method: "Manual",
    status: "Success",
    riskScore: 20,
  },
  {
    id: "tx5",
    sender: "Shaun",
    receiver: "Grocery Mart",
    amount: 850,
    time: "2 days ago, 11:20 AM",
    method: "QR",
    status: "Success",
    riskScore: 10,
  },
  {
    id: "tx6",
    sender: "Amit",
    receiver: "Shaun",
    amount: 1200,
    time: "3 days ago, 04:15 PM",
    method: "Manual",
    status: "Success",
    riskScore: 25,
  },
  {
    id: "tx7",
    sender: "Shaun",
    receiver: "Ravi",
    amount: 3000,
    time: "4 days ago, 09:45 AM",
    method: "Manual",
    status: "Suspicious",
    fraudType: "QR Tampering",
    riskScore: 65,
    reason: "Multiple payment attempts",
  },
  {
    id: "tx8",
    sender: "Neha",
    receiver: "Shaun",
    amount: 750,
    time: "5 days ago, 03:20 PM",
    method: "Manual",
    status: "Success",
    riskScore: 18,
  },
  {
    id: "tx9",
    sender: "Shaun",
    receiver: "Rahul",
    amount: 1800,
    time: "6 days ago, 12:10 PM",
    method: "Manual",
    status: "Success",
    riskScore: 22,
  },
  {
    id: "tx10",
    sender: "Shaun",
    receiver: "Electricity Bill",
    amount: 1250,
    time: "7 days ago, 10:30 AM",
    method: "Bill Payment",
    status: "Success",
    riskScore: 5,
  },
]

