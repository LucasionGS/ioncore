import { Link } from "@ioncore/theme/Link";
import { Router, Routes } from "@ioncore/theme/Router";
import logo from "../../assets/logo.svg";
import BaseApi from "../../Api/BaseApi";
import { Button } from "@ioncore/theme";
import { IconArrowBack, IconHome, IconUsers } from "@tabler/icons-react";
import "./Admin.scss";
// import { MySharedInterface } from "@shared/shared"; // Shared code between Client and Server

const subRouterPages: Routes = [
  {
    title: "Admin Home",
    path: /^\/admin$/,
    component: async () => {
      const AdminHomePage = (await import("./AdminHome/AdminHome")).default;
      return <AdminHomePage />
    }
  },
  {
    title: "Admin | Users",
    path: /^\/admin\/users$/,
    component: async () => {
      const AdminUsersPage = (await import("./AdminUsers/AdminUsers")).default;
      return <AdminUsersPage />
    }
  },
];

function AdminPage() {
  const user = BaseApi.getUser();
  if (!user?.isAdmin) {
    return (
      <h2>Not Authorized</h2>
    );
  }
  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <SidebarLink icon={<IconArrowBack />} href="/">Back To Web</SidebarLink>
        <SidebarLink icon={<IconHome />} href="/admin">Home</SidebarLink>
        <SidebarLink icon={<IconUsers />} href="/admin/users">Users</SidebarLink>
      </div>
      <div className="admin-content">
        <Router pages={subRouterPages} />
      </div>
    </div>
  );
}

function SidebarLink(props: { icon?: React.ReactNode, href: string, children: string }) {
  const isActive = window.location.pathname === props.href;
  return (
    <a className={"sidebar-link" + (isActive ? " sidebar-link--active" : "")} href={props.href} title={props.children}>
      <span className="sidebar-link-icon">{props.icon}</span> <span className="sidebar-link-text">{props.children}</span>
    </a>
  );
}

export default AdminPage;
