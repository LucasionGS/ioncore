import { Button, Checkbox, CheckboxGroup, Input, Paper, Select, Textarea } from "@ioncore/theme"
import { ClientUser, RoleAttributesObject } from "@shared/models";
import React from "react"
import UserApi from "../../../Api/UserApi";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import Modal, { useModal } from "../../../components/Modal/Modal"
import "./AdminRoles.scss"

export default function AdminRoles() {
  const roles = UserApi.useAvailableRoles();
  const [_updateI, _update] = React.useState(0);
  const forceUpdate = () => _update(_updateI + 1);

  return (
    <Paper>
      <h1>Role Manager</h1>
      <p>
        Roles are used to group users together and give them permissions.
      </p>
      <table className="admin-styled-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Role name</th>
            <th>Inherits</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles?.map(role => (
            <RoleRow key={role.id} availableRoles={roles} role={role} onEditFinished={() => {
              forceUpdate();
            }} />
          ))}
        </tbody>
      </table>
    </Paper>
  )
}

function RoleRow({ role, availableRoles, onEditFinished }: { role: RoleAttributesObject, availableRoles: RoleAttributesObject[], onEditFinished?: () => void }) {
  const { isOpen, open, close } = useModal();

  const [name, setName] = React.useState(role.name);
  const [inherit, setInherit] = React.useState(role.inherit ?? undefined);
  const [permissions, setPermissions] = React.useState(role.permissions.join("\n"));

  const inheritName = React.useMemo(() => {
    if (!role.inherit) return undefined;
    const r = availableRoles.find(r => r.id === role.inherit);
    return r?.name ?? role.inherit;
  }, [role.inherit, availableRoles]);

  return (
    <>
      <tr>
        <td>{role.id}</td>
        <td>{role.name}</td>
        <td>{inheritName}</td>
        <td title={role.permissions.join(",")}>{role.permissions.length} permissions</td>
        <td>
          <Button variant="primary" onClick={open}><IconEdit /></Button>
          <Button variant="secondary"><IconEye /></Button>
          <Button variant="danger"><IconTrash /></Button>
        </td>
      </tr>
      <Modal opened={isOpen} onClose={() => {
        setName(role.name);
        setInherit(role.inherit);
        setPermissions(role.permissions.map(s => s.trim()).join("\n"));
        close();
      }}>
        <h1>Edit {role.name}</h1>
        <Input label="Role name" value={name} onChange={(e, v) => setName(v)} />
        <br />
        <label style={{ fontWeight: "bold" }}>Inherits</label>
        <Select
          // direction="vertical"
          value={inherit}
          onChange={(v) => setInherit(v)} options={[
            {
              name: "<None>",
              id: undefined,
            },
            ...availableRoles
          ].map(r => ({ value: r.id, label: r.name }))}
        />
        <br />
        <Textarea containerStyle={{ width: "100%" }} style={{ resize: "vertical", width: "100%", minHeight: 320 }} label="Permissions" value={permissions} onChange={(e, v) => setPermissions(v)} />
        <br />
        <sub>Comma or whitespace separated list of permissions.</sub>
        <br />

        <Button variant="success" onClick={() => {
          const newRole = { ...role };
          newRole.name = name;
          newRole.inherit = inherit ?? null!;
          newRole.permissions = permissions.split(/,|\s/).map(s => s.trim()).filter(Boolean);
          UserApi.updateRole(role).then(() => {
            Object.assign(role, newRole);
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