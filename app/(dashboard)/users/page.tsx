"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
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
  Search,
  Phone,
  MapPin,
  Plus,
  MoreVertical,
  X,
  Eye,
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useApp();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const showSizes = [25, 50, 100, 200];
  // Initial auth check
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "ADMIN" && user.role !== "WORKER") {
      router.push("/");
      return;
    }
    setLoading(false);
  }, [user, router]);

  const fetchUsers = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `/api/users?page=${pageIndex}&limit=${pageSize}${
          searchTerm ? `&search=${searchTerm}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      setData(result.users);
      setTotalUsers(result.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [pageIndex, pageSize, searchTerm]);

  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "WORKER") {
      fetchUsers();
    }
  }, [user?.role, fetchUsers]);

  const handlePageChange = (newPage: number) => {
    setPageIndex(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0); // Reset to first page when changing page size
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPageIndex(0); // Reset to first page when searching
  };

  const columns = [
    columnHelper.accessor("id", {
      header: ({ column }) => (
        <div
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User ID
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (info) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg text-gray-500">
            #{info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <div
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {info.getValue().charAt(0).toUpperCase()}
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
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="h-4 w-4" />
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
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Phone
          <ArrowUpDown className="h-4 w-4" />
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
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Location
          <ArrowUpDown className="h-4 w-4" />
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
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Join Date
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(info.getValue()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(info.getValue()).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <div className="flex flex-row items-center justify-center">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(row.original);
            }}
            className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </div>

          <div
            className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => router.push(`/users/${row.original.id}`)}
          >
            <Eye className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: searchTerm,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalUsers / pageSize),
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex,
          pageSize,
        });
        handlePageChange(newState.pageIndex);
      }
    },
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

          <div className="flex items-center ">
            <div className="self-center relative">
              <button
                onClick={() => setSelectedUser(user)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="self-center relative">
              <button
                onClick={() => router.push(`/users/${user.id}`)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Eye className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
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
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-10 py-2.5 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-orange-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600/90 active:bg-primary/95"
              >
                <Plus className="h-4 w-4" />
                Add User
              </button>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block">
            <div className="relative mt-4">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
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
                                  <div>
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
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
                              <td
                                key={cell.id}
                                className="whitespace-nowrap px-6 py-4"
                              >
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
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4">
            {data.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between px-2 sm:px-6">
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-8 rounded-lg border-gray-200 bg-white text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                {showSizes.map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {pageIndex + 1} of {Math.ceil(totalUsers / pageSize)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(0)}
                disabled={pageIndex === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pageIndex - 1)}
                disabled={pageIndex === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pageIndex + 1)}
                disabled={pageIndex >= Math.ceil(totalUsers / pageSize) - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  handlePageChange(Math.ceil(totalUsers / pageSize) - 1)
                }
                disabled={pageIndex >= Math.ceil(totalUsers / pageSize) - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
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
