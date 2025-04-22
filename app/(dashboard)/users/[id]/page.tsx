"use client"

import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie";
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Package, FileText, Clock, User as UserIcon, Phone, MapPin, Calendar, DollarSign, ShoppingBag, AlertCircle } from 'lucide-react';
import Image from 'next/image';

type UserResponse = {
  user: {
    id: number,
    phoneNumber: string,
    name: string,
    address: string,
    city: string,
    country: string,
    role: string,
    createdAt: string,
    updatedAt: string,
    isActive: boolean,
    lastLogin: string,
    Invoice: Invoice[],
    orders: Order[]
  }
}

type Invoice = {
  id: number,
  invoiceNumber: string,
  date: string,
  dueDate: string,
  status: 'PAID' | 'PENDING' | 'OVERDUE',
  total: number,
  paymentMethod?: string,
  notes?: string,
}

type Order = {
  id: number,
  title?: string,
  size?: string,
  color?: string,
  country: string,
  quantity: number,
  price: number,
  shippingPrice: number,
  status: string,
  orderNumber?: string,
  productLink?: string,
  imageUrl?: string,
  notes?: string,
  createdAt: string,
  updatedAt: string,
}

type OrderStatus = 
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'COMPLETED'
  | 'APPROVED'
  | 'PURCHASED'
  | 'REJECTED'
  | 'PENDING'
  | 'RECEIVED_IN_TURKEY'
  | 'IN_TRANSIT'
  | 'DELIVERED_TO_WAREHOUSE'
  | 'PREPAID';

type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE';

// Combined type for any kind of status
type Status = OrderStatus | InvoiceStatus;

export default function UserViewPage() {
  const params = useParams();
  const [user, setUser] = useState<UserResponse>();
  const [activeTab, setActiveTab] = useState('orders');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async() => {
    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const _req = await fetch(`/api/users/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if(!_req.ok) {
        const data = await _req.json();
        toast.error(data.error);
        return;
      }
      
      setUser(await _req.json());
    } catch {
      toast.error("Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  });

  const getStatusColor = (status: Status): string => {
    const statusColors: Record<Status, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-indigo-100 text-indigo-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      RETURNED: "bg-orange-100 text-orange-800",
      COMPLETED: "bg-green-100 text-green-800",
      APPROVED: "bg-teal-100 text-teal-800",
      PURCHASED: "bg-cyan-100 text-cyan-800",
      REJECTED: "bg-red-100 text-red-800",
      RECEIVED_IN_TURKEY: "bg-purple-100 text-purple-800",
      IN_TRANSIT: "bg-blue-100 text-blue-800",
      DELIVERED_TO_WAREHOUSE: "bg-teal-100 text-teal-800",
      PREPAID: "bg-green-100 text-green-800",
      PAID: "bg-green-100 text-green-800",
      OVERDUE: "bg-red-100 text-red-800"
    };
    
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <AlertCircle className="mx-auto text-red-500 h-12 w-12 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-gray-600">The requested user information could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <UserIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.user.name}</h1>
                <div className="flex items-center mt-1 text-blue-100">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{user.user.phoneNumber}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <div className="text-xs text-blue-100">Member Since</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(user.user.createdAt).split(',')[0]}</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <div className="text-xs text-blue-100">Account Type</div>
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  <span className="capitalize">{user.user.role.toLowerCase()}</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <div className="text-xs text-blue-100">Status</div>
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${user.user.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>{user.user.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {user.user.address && (
            <div className="mt-4 flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-blue-200" />
              <div className="text-blue-100">
                {user.user.address}
                {user.user.city && `, ${user.user.city}`}
                {user.user.country && `, ${user.user.country}`}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Orders
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('invoices')}
              className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'invoices' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Invoices
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'activity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Activity
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Order History</h2>
              <div className="text-sm text-gray-500">
                Total Orders: {user.user.orders?.length || 0}
              </div>
            </div>
            
            {!user.user.orders || user.user.orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No Orders Yet</h3>
                <p className="text-gray-600">This user hasnt placed any orders yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {user.user.orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="font-semibold text-gray-900">
                              {order.title || `Order #${order.id}`}
                            </span>
                            <span className={`ml-3 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status as Status)}`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-gray-500 text-sm">
                            Order Number: {order.orderNumber || `ORD-${order.id}`}
                          </div>
                          <div className="text-gray-500 text-sm">
                            Placed on {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ${order.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            + ${order.shippingPrice.toFixed(2)} shipping
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-xs text-gray-500 uppercase mb-1">Quantity</div>
                          <div className="font-medium">{order.quantity}</div>
                        </div>
                        
                        {order.country && (
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-gray-500 uppercase mb-1">Country</div>
                            <div className="font-medium">{order.country}</div>
                          </div>
                        )}
                        
                        {order.size && (
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-gray-500 uppercase mb-1">Size</div>
                            <div className="font-medium">{order.size}</div>
                          </div>
                        )}
                        
                        {order.color && (
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-xs text-gray-500 uppercase mb-1">Color</div>
                            <div className="font-medium">{order.color}</div>
                          </div>
                        )}
                      </div>
                      
                      {order.notes && (
                        <div className="mt-4 text-sm bg-blue-50 p-3 rounded border border-blue-100">
                          <div className="font-medium text-blue-800 mb-1">Notes:</div>
                          <div className="text-blue-700">{order.notes}</div>
                        </div>
                      )}
                      
                      {order.productLink && (
                        <div className="mt-4">
                          <a href={order.productLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                            View Product
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {order.imageUrl && (
                      <div className="border-t">
                        <div className="p-4">
                          <div className="text-sm font-medium text-gray-500 mb-2">Product Image</div>
                          <Image src={order.imageUrl} alt="Product" className="w-full max-h-48 object-contain" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Invoice History</h2>
              <div className="text-sm text-gray-500">
                Total Invoices: {user.user.Invoice?.length || 0}
              </div>
            </div>
            
            {!user.user.Invoice || user.user.Invoice.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No Invoices</h3>
                <p className="text-gray-600">This user doesnt have any invoices yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {user.user.Invoice.map((invoice) => (
                  <div key={invoice.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="font-semibold text-gray-900">
                              Invoice #{invoice.invoiceNumber}
                            </span>
                            <span className={`ml-3 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </div>
                          <div className="text-gray-500 text-sm">
                            Created on {formatDate(invoice.date)}
                          </div>
                          <div className="text-gray-500 text-sm">
                            Due {formatDate(invoice.dueDate)}
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ${invoice.total.toFixed(2)}
                          </div>
                          {invoice.paymentMethod && (
                            <div className="text-sm text-gray-500">
                              via {invoice.paymentMethod}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {invoice.notes && (
                        <div className="mt-4 text-sm bg-gray-50 p-3 rounded">
                          <div className="font-medium mb-1">Additional Notes:</div>
                          <div className="text-gray-700">{invoice.notes}</div>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          View Full Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Account Activity</h2>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="p-5">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div>
                    <div className="font-medium">Last Login</div>
                    <div className="text-gray-500 text-sm">
                      {user.user.lastLogin ? formatDate(user.user.lastLogin) : 'Never logged in'}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div>
                    <div className="font-medium">Account Created</div>
                    <div className="text-gray-500 text-sm">
                      {formatDate(user.user.createdAt)}
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <UserIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div>
                    <div className="font-medium">Account Updated</div>
                    <div className="text-gray-500 text-sm">
                      {formatDate(user.user.updatedAt)}
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Recent Orders</div>
                    <div className="text-gray-500 text-sm">
                      {user.user.orders?.length > 0 
                        ? `Last order placed on ${formatDate(user.user.orders[0].createdAt)}`
                        : 'No orders yet'}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded">
                    <ShoppingBag className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white rounded-lg shadow">
              <div className="p-5">
                <h3 className="font-medium text-lg mb-4">Account Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-blue-800 font-medium">Total Orders</div>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{user.user.orders?.length || 0}</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-green-800 font-medium">Total Spent</div>
                      <div className="bg-green-100 p-2 rounded-full">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      ${user.user.orders?.reduce((total, order) => total + (order.price || 0) + (order.shippingPrice || 0), 0).toFixed(2) || '0.00'}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-purple-800 font-medium">Pending Invoices</div>
                      <div className="bg-purple-100 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {user.user.Invoice?.filter(inv => inv.status === 'PENDING').length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}