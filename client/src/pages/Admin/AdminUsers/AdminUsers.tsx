import { Button, Checkbox, CheckboxGroup, Input, Paper, Select } from '@ioncore/theme'
import { ClientUser, RoleAttributes, RoleAttributesObject } from '@shared/models';
import React from 'react'
import UserApi from '../../../Api/UserApi';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import Modal, { useModal } from "../../../components/Modal/Modal"
import './AdminUsers.scss'

export default function AdminUsers() {
  const users = useUsers();
  const roles = UserApi.useRoles();
  const [_updateI, _update] = React.useState(0);
  const forceUpdate = () => _update(_updateI + 1);
  
  return (
    <Paper>
      <h1>User Manager</h1>
      <p>
        Here you can manage all users. You can edit their username, profile picture, roles and more.
      </p>
      <table className="admin-styled-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Profile Picture</th>
            <th>Admin</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles && users?.map(user => (
            <UserRow key={user.id} user={user} availableRoles={roles} onEditFinished={() => {
              forceUpdate();
            }} />
          ))}
        </tbody>
      </table>
    </Paper>
  )
}

function UserRow({ user, availableRoles, onEditFinished }: { user: ClientUser, availableRoles: RoleAttributesObject[], onEditFinished?: () => void }) {
  const { isOpen, open, close } = useModal();

  const [username, setUsername] = React.useState(user.username);
  const [roles, setRoles] = React.useState(user.roles ?? []);

  return (
    <>
      <tr>
        <td>{user.id}</td>
        <td>{user.username}</td>
        <td>{user.profilePicture ? (<img src={user.profilePicture} alt="Profile" />) : "<No image>"}</td>
        <td>{user.isAdmin ? "Admin" : "User"}</td>
        {/* <td>{user.roles?.join(", ") ?? "<Unavailable>"}</td> */}
        <td>{user.roles?.length ?? 0} roles</td>
        <td>
          <Button variant="primary" onClick={open}><IconEdit /></Button>
          <Button variant="secondary"><IconEye /></Button>
          <Button variant="danger"><IconTrash /></Button>
        </td>
      </tr>
      <Modal opened={isOpen} onClose={() => {
        setUsername(user.username);
        setRoles(user.roles ?? []);
        close();
      }}>
        <h1>Edit {user.username}</h1>
        <Input label="Username" value={username} onChange={(e, v) => setUsername(v)} />
        <CheckboxGroup onChange={(checked, value) => {
          if (checked) {
            setRoles([...roles, value!]);
          } else {
            setRoles(roles.filter(r => r !== value));
          }
        }}>
          {availableRoles.map(role => (
            <Checkbox alwaysShowTick key={role.id} label={role.name} value={role.name} checked={roles.includes(role.name)} />
          ))}
        </CheckboxGroup>

        <Button variant="success" onClick={() => {
          user.username = username;
          user.roles = roles;
          UserApi.updateUser(user).then(() => {
            close();
            onEditFinished?.();
          });
        }}>Save</Button>
      </Modal>
    </>
  );
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