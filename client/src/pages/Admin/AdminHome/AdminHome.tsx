import { Button, Paper } from "@ioncore/theme"
import React from "react"
import Modal, { useModal } from "../../../components/Modal/Modal"
import BaseApi from "../../../Api/BaseApi"

export default function AdminHome() {
  const user = BaseApi.getUser();
  return (
    <Paper>
      <h1>Home</h1>
      <p>
        Welcome, {user?.username}!
      </p>
      <p>
        Nothing to see here yet...
        Check out the <a href="/admin/users">Users</a> page.
      </p>
    </Paper>
  )
}
