import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../api/userApi";
import { User } from "../types/user.types";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";

import Badge from "../../../components/ui/badge/Badge";
import { useNavigate } from "react-router";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../../icons";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/users/create");
  };
  
  const handleEdit = (id: number) => {
    navigate(`/users/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <PageMeta
        title="Users | NexCart Dashboard"
        description="Users Management Page"
      />

      <PageBreadcrumb pageTitle="Users" />

      <div className="space-y-6">
        <ComponentCard title="Users List">
          <div className="mb-4 flex justify-end">
            <Button
              onClick={handleCreate}
              variant="primary"
              size="md"
            >
                <PlusIcon />
              Add New User
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500"
                    >
                      ID
                    </TableCell>

                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500"
                    >
                      Name
                    </TableCell>

                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500"
                    >
                      Email
                    </TableCell>

                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500"
                    >
                      Phone
                    </TableCell>

                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500"
                    >
                      Status
                    </TableCell>

                    <TableCell
                      isHeader
                      className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell className="px-5 py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="px-5 py-4">
                          {user.id}
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          {user.name}
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          {user.email}
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          {user.phone || "-"}
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          <Badge
                            size="sm"
                            color={
                              user.status === "active"
                                ? "success"
                                : "error"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          <div className="flex justify-center gap-2">
                            <Button
                              onClick={() => handleEdit(user.id)}
                              variant="primary"
                              size="md"
                              >
                              <PencilIcon />
                            </Button>
                            <Button
                              onClick={() => handleDelete(user.id)}
                              variant="danger"
                              size="md"
                            >
                              <TrashBinIcon />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default UsersPage;