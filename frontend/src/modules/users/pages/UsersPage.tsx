import { useEffect, useState, useCallback } from "react";
import { getUsers, deleteUser } from "../api/userApi";
import { User, PaginationMeta } from "../types/user.types";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import Badge from "../../../components/ui/badge/Badge";
import DataTable, { Column } from "../../../components/ui/DataTable/DataTable";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");

  const navigate = useNavigate();

  const loadUsers = useCallback(async (
    pageNumber = 1,
    search = "",
    status = "all"
  ) => {
    try {
      setLoading(true);
  
      const response = await getUsers(pageNumber, search, status);
  
      setUsers(response.data);
      setMeta(response.meta);
  
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(page, searchTerm, filterValue);
  }, [page, searchTerm, filterValue, loadUsers]);

  const handlePageChange = (newPage: number, search?: string, filter?: string) => {
    if (search !== undefined) setSearchTerm(search);
    if (filter !== undefined) setFilterValue(filter);
    setPage(newPage);
  };

  const handleCreate = () => {
    navigate("/users/create");
  };

  const handleEdit = (id: number) => {
    navigate(`/users/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");

    if (!confirmDelete) return;

    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadUsers(page, searchTerm, filterValue);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    }
  };

  const columns: Column<User>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-16",
    },
    {
      key: "name",
      header: "Name",
      className: "min-w-[150px]",
    },
    {
      key: "email",
      header: "Email",
      className: "min-w-[200px]",
    },
    {
      key: "phone",
      header: "Phone",
      render: (user) => user.phone || "-",
      className: "min-w-[120px]",
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <Badge
          size="sm"
          color={user.status === "active" ? "success" : "error"}
        >
          {user.status}
        </Badge>
      ),
      className: "w-24",
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24 text-center",
    },
  ];

  const rowActions = (user: User) => (
    <div className="flex justify-center gap-2">
      <Button
        onClick={() => handleEdit(user.id)}
        variant="primary"
        size="sm"
      >
        <PencilIcon className="h-4 w-4" />
      </Button>

      <Button
        onClick={() => handleDelete(user.id)}
        variant="danger"
        size="sm"
      >
        <TrashBinIcon className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <>
      <PageMeta
        title="Users | NexCart Dashboard"
        description="Manage users"
      />

      <PageBreadcrumb pageTitle="Users" />

      <ComponentCard title="Users List">
        <div className="mb-4 flex justify-end">
          <Button
            onClick={handleCreate}
            variant="primary"
            size="sm"
          >
            +
            Add New User
          </Button>
        </div>

        <DataTable
          data={users ?? []}
          columns={columns}
          loading={loading}
          enableSearch
          searchPlaceholder="Search by name, email or phone..."
          searchFields={["name", "email", "phone"]}
          enableFilter
          filterOptions={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          filterKey="status"
          enablePagination
          meta={meta}
          currentPage={page}
          onPageChange={handlePageChange}
          actions={rowActions}
          emptyMessage="No users found"
          loadingMessage="Loading users..."
        />
      </ComponentCard>
    </>
  );
};

export default UsersPage;