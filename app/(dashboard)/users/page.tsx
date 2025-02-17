"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Search,
  Phone,
  MapPin,
  Plus,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import UserEditModal from "@/components/users/UserEditModal";
import { useApp } from "@/providers/AppProvider";
import { useRouter } from "next/navigation";
import CreateUserModal from "@/components/users/CreateUserModal";
import Cookies from "js-cookie";

interface User {
  id: number;
  name: string;
  phoneNumber: string;
  role: "ADMIN" | "WORKER" | "CUSTOMER";
  address: string | null;
  city: string | null;
  country: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const roleColors = {
  ADMIN: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-500",
    dot: "bg-purple-500",
  },
  WORKER: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-500",
    dot: "bg-orange-500",
  },
  CUSTOMER: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-500",
    dot: "bg-blue-500",
  },
};

const columnHelper = createColumnHelper<User>();

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<User[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(3);
  const { user } = useApp();
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const queryParams = new URLSearchParams({
        page: pageIndex.toString(),
        limit: pageSize.toString(),
        ...(globalFilter ? { search: globalFilter } : {}),
      });

      const response = await fetch(`/api/users?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { users, total } = await response.json();
        setData(users);
        setTotalUsers(total);
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [router, pageIndex, pageSize, globalFilter]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "ADMIN" && user.role !== "WORKER") {
      router.push("/");
      return;
    }

    fetchUsers();
  }, [user, router, fetchUsers]);

  // Debounce global filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageIndex(0); // Reset to first page when filtering
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [globalFilter]);

  // Handle pagination changes
  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    fetchUsers();
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
    fetchUsers();
  };

  const columns = [
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="h-3 w-3 text-gray-500" />
        </div>
      ),
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
            <Image
              src={
                info.row.original.imageUrl ||
                "data:image/png;base64,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"
              }
              width={40}
              height={40}
              alt={info.getValue()}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="h-3 w-3" />
        </div>
      ),
      cell: (info) => {
        const role = info.getValue();
        const colors = roleColors[role];
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {role}
          </span>
        );
      },
    }),
    columnHelper.accessor("phoneNumber", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Phone
          <ArrowUpDown className="h-3 w-3" />
        </div>
      ),
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("address", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Location
          <ArrowUpDown className="h-3 w-3 text-gray-500" />
        </div>
      ),
      cell: (info) => {
        const address = [
          info.getValue(),
          info.row.original.city,
          info.row.original.country,
        ]
          .filter(Boolean)
          .join(", ");
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {address || "No address"}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Join Date
          <ArrowUpDown className="h-3 w-3 text-gray-500" />
        </div>
      ),
      cell: (info) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <div className="relative">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(row.original);
            }}
            className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            <svg
              className="h-5 w-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true,
    pageCount: Math.ceil(totalUsers / pageSize),
  });

  // Mobile card view component
  const UserCard = ({ user }: { user: User }) => {
    const location = [user.address, user.city, user.country]
      .filter(Boolean)
      .join(", ");

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {user.name}
              </h3>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    roleColors[user.role].bg
                  } ${roleColors[user.role].text}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      roleColors[user.role].dot
                    }`}
                  />
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedUser(user)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Phone className="h-4 w-4" />
            {user.phoneNumber}
          </div>
          {location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="h-4 w-4" />
              {location}
            </div>
          )}
          <div className="text-xs text-gray-500">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Users
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              A list of all users in the system
            </p>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-10 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-orange-500"
                />
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600/90 active:bg-primary/95"
              >
                <Plus className="h-4 w-4" />
                Add User
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {table.getRowModel().rows.map((row) => (
              <UserCard key={row.original.id} user={row.original} />
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            scope="col"
                            className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-gray-900/50 dark:text-gray-400"
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="whitespace-nowrap px-6 py-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="w-full sm:w-auto rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-primary text-sm leading-6 dark:bg-gray-800"
                >
                  {[25, 50, 100, 200, 300].map((size) => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Page {pageIndex + 1} of {Math.ceil(totalUsers / pageSize)}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={pageIndex === 0}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-gray-600 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">First</span>
                  <ChevronsLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handlePageChange(Math.max(0, pageIndex - 1))}
                  disabled={pageIndex === 0}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-gray-600 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(Math.ceil(totalUsers / pageSize) - 1, pageIndex + 1))}
                  disabled={pageIndex >= Math.ceil(totalUsers / pageSize) - 1}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-gray-600 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handlePageChange(Math.ceil(totalUsers / pageSize) - 1)}
                  disabled={pageIndex >= Math.ceil(totalUsers / pageSize) - 1}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-gray-600 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Last</span>
                  <ChevronsRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserEditModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onUserUpdated={fetchUsers}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={fetchUsers}
      />
    </div>
  );
}
