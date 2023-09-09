import { Button, Checkbox, CheckboxGroup, Input, Paper, Select, Textarea, Modal, useManagedModal, useModal } from "@ioncore/theme"
import { ClientUser, RoleAttributesObject } from "@shared/models";
import React from "react"
import UserApi from "../../../Api/UserApi";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import "./AdminRoles.scss"

export default function AdminRoles() {
  const [roles, reloadRoles] = UserApi.useAvailableRoles();
  const [_updateI, _update] = React.useState(0);
  const forceUpdate = () => _update(_updateI + 1);

  return (
    <Paper>
      <h1>Role Manager</h1>
      <p>
        Roles are used to group users together and give them permissions.
      </p>
      <Button
        onClick={() => {
          UserApi.createRole({}).then(() => {
            reloadRoles();
          });
        }}
      >New Role</Button>
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
            <RoleRow key={role.id} availableRoles={roles} role={role} onEditFinished={(refresh = false) => {
              if (refresh) reloadRoles();
              else forceUpdate();
            }} />
          ))}
        </tbody>
      </table>
    </Paper>
  )
}

function RoleRow({ role, availableRoles, onEditFinished }: { role: RoleAttributesObject, availableRoles: RoleAttributesObject[], onEditFinished?: (refresh?: boolean) => void }) {
  const { close, isOpen, open } = useModal();
  const {
    close: delClose,
    isOpen : delIsOpen,
    open: delOpen
  } = useModal();

  const [name, setName] = React.useState(role.name ?? "");
  const [inherit, setInherit] = React.useState(role.inherit ?? undefined);
  const [permissions, setPermissions] = React.useState(role.permissions.join("\n"));

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

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
          <Button variant="danger" onClick={delOpen}><IconTrash /></Button>
        </td>
      </tr>
      <Modal opened={isOpen} transition="none" onClose={() => {
        setName(role.name);
        setInherit(role.inherit);
        setPermissions(role.permissions.map(s => s.trim()).join("\n"));
        setErrorMessage(undefined);
        close();
      }}>
        <h1>Edit {role.name}</h1>
        {errorMessage && (
          <Paper style={{ backgroundColor: "red", padding: 8 }}>
            {errorMessage}
          </Paper>
        )}
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
            ...(role.id ? availableRoles.filter(r => r.id !== role.id) : availableRoles)
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
          UserApi.updateRole(newRole).then(() => {
            Object.assign(role, newRole);
            setErrorMessage(undefined);
            close();
            onEditFinished?.();
          }).catch(e => {
            setErrorMessage(e.message);
          });
        }}>Save</Button>
      </Modal>
      <Modal closeOnOutsideClick opened={delIsOpen} transition="none" onClose={() => {
        delClose();
      }}>
        <h1>Delete {role.name}</h1>
        <p>Are you sure you want to delete this role?</p>
        <Button variant="danger" onClick={() => {
          UserApi.deleteRole(role).then(() => {
            onEditFinished?.(true);
            delClose();
          });
        }}>Delete</Button>
      </Modal>
    </>
  );
}