# Splitwise  1.0


## Feature Description 

1. Authentication (signup / simple signin) - 5 users 
2. Expense - Equally / Percentages
   Only one person can pay
3. User need to see Balance for all other users what they owe and what they get
list of balances with other users 
4. User expense history 


DB 

User 
- id
- group_id -> multitancy

Expense 
- id 
- name
- amount
- split_type

ExpenseParts
- id 
- expense_id 
- paidUser -> User
- owedUser -> User
- splitAmount


#API

## Authentication
POST /api/user/create - 201
POST /api/user/login

## Expense Creation
POST /api/expense - 201
{
    split_type: "percentage" | "equal"
    name: Expense Name 
    amount: 100
    splits: [{userId: 1, split: '20%'}] // optional
    paidBy: 3
}

GET /api/user/:id/expense
[]

## balances

GET /api/user/balances



