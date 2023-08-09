import { Button, Paper } from '@ioncore/theme'
import { ClientUser } from '@shared/models';
import React from 'react'
import UserApi from '../../../Api/UserApi';
import './AdminUsers.scss'
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';

export default function AdminUsers() {
  const users = useUsers();

  return (
    <Paper>
      <h1>Admin Users</h1>
      <table className="admin-styled-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>User ID</th>
            <th>Admin</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.id}</td>
              <td>{user.isAdmin ? "Admin" : "User"}</td>
              <td>{user.roles?.join(", ")}</td>
              <td>
                <Button variant="primary"><IconEdit /></Button>
                <Button variant="secondary"><IconEye /></Button>
                <Button variant="danger"><IconTrash /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Paper>
  )
}

function useUsers() {
  const [users, setUsers] = React.useState<ClientUser[] | null>(null);

  React.useEffect(() => {
    UserApi.getUsers().then(setUsers);
    // setUsers(
    //   Array.from({ length: 50 }, (_, i) => ({
    //     id: `${i}`,
    //     username: `user${i}`,
    //     isAdmin: i % 2 === 0,
    //     roles: ["role1", "role2"],
    //   }))
    // );
  }, []);

  return users;
}