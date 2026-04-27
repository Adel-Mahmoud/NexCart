// UsersPage.tsx
import { useEffect, useState, useCallback } from "react";
import { DataTable } from "../../../components/ui/DataTable/DataTable";
import Button from "../../../components/ui/button/Button";
import { User, PaginationMeta } from "../types/user.types";
import { getUsers, deleteUser } from "../api/userApi";
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import Badge from "../../../components/ui/badge/Badge";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import Swal from 'sweetalert2';

const columnHelper = createColumnHelper<User>();

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");

  const navigate = useNavigate();

  const loadUsers = useCallback(async (pageNumber = 1, search = "", status = "all") => {
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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });
  
    if (result.isConfirmed) {
      const loadingId = toast.loading("Deleting user...");
      
      try {
        await deleteUser(id);
        toast.success("User deleted successfully", { id: loadingId });
        
        if (users.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          loadUsers(page, searchTerm, filterValue);
        }
      } catch (error) {
        toast.error("Failed to delete user", { id: loadingId });
      }
    }
  };

  const columns: ColumnDef<User, any>[] = [
    columnHelper.accessor('id', {
      header: '#',
      cell: ({ row }) => {
        return (page - 1) * (meta?.perPage ?? 10) + row.index + 1;
      },
      meta: { className: "w-16" }
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => <div className="font-medium text-gray-900">{info.getValue()}</div>,
      meta: { className: "min-w-[150px]" }
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => <div className="text-gray-600">{info.getValue()}</div>,
      meta: { className: "min-w-[200px]" }
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
      cell: (info) => info.getValue() || "-",
      meta: { className: "min-w-[120px]" }
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Badge
          size="sm"
          color={info.getValue() === "active" ? "success" : "error"}
        >
          {info.getValue()}
        </Badge>
      ),
      meta: { className: "w-24" }
    }),
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => handleEdit(row.original.id)}
            variant="primary"
            size="sm"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleDelete(row.original.id)}
            variant="danger"
            size="sm"
          >
            <TrashBinIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
      meta: { className: "w-24 text-center" }
    }
  ];

  return (
    <>
      <PageMeta title="Users | NexCart Dashboard" description="Manage users" />
      <PageBreadcrumb pageTitle="Users" />
      
      <ComponentCard title="Users List">
        <div className="mb-4 flex justify-end">
          <Button onClick={handleCreate} variant="primary" size="sm">
            + Add New User
          </Button>
        </div>

        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          enableSearch
          searchPlaceholder="Search by name, email or phone..."
          searchFields={["name", "email", "phone"]}
          enableFilter={false}
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
          emptyMessage="No users found"
          loadingMessage="Loading users..."
        />
      </ComponentCard>
    </>
  );
};

export default UsersPage;