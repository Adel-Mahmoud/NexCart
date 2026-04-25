import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getUser, updateUser } from "../api/userApi";
import { UpdateUserInput, User } from "../types/user.types";

import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";

const initialForm: UpdateUserInput = {
  name: "",
  email: "",
  phone: "",
  status: "active",
};

const EditUserPage = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<UpdateUserInput>(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setFetching(true);
      try {
        if (id) {
          const user: User = await getUser(Number(id));
          setForm({
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            password: user.password || "",
            status: user.status,
          });
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "An error occurred while fetching the user."
        );
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (id) {
        console.log(form)
        await updateUser(Number(id), form);
        navigate("/users");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "An error occurred while updating the user."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-60">
        <span>Loading user data...</span>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Edit User | NexCart Dashboard" description="Edit user details" />
      <PageBreadcrumb pageTitle="Edit User" />
      <div className="mt-6 w-full">
        <ComponentCard title="Edit User">
          <form
            className="space-y-6 w-full"
            onSubmit={handleSubmit}
            style={{ width: "100%" }}
          >
            <div>
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="name"
              >
                Name
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter Name"
                disabled={loading}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter Email"
                disabled={loading}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="phone"
              >
                Phone
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                id="phone"
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter Phone (optional)"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="password">
                Password
              </label>
              <input
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter Password"
                disabled={loading}
              />
            </div>
            <div>
              <label
                className="block text-gray-700 font-medium mb-1"
                htmlFor="status"
              >
                Status
              </label>
              <select
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {error && (
              <div className="text-red-500 text-sm font-medium">{error}</div>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/users")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Update User"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default EditUserPage;