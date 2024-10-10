"use client"

import React, { useState, useEffect } from 'react';
import { DataTable } from '../DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { UserPlusIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '../Layout';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'lastActive',
    header: 'Last Active',
  },
];

export function Users() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch users data here
    // For now, we'll use mock data
    const mockUsers: User[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', lastActive: '2023-07-01' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', lastActive: '2023-06-28' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', lastActive: '2023-07-02' },
    ];
    setUsers(mockUsers);
  }, []);

  return (
    <Layout>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button>
          <UserPlusIcon className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} />
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
}