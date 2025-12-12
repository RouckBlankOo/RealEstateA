"use client";

import React, { useEffect, useState } from "react";
import { apiService, API_URL } from "@/services/api";
import { formatDistanceToNow } from "date-fns";

interface SupportTicket {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  email: string;
  content: string;
  attachments: string[];
  status: string;
  isRead: boolean;
  createdAt: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      console.log("🔄 Fetching support tickets...");
      const token = localStorage.getItem("supportToken");
      console.log("🔑 Token exists:", !!token);

      if (!token) {
        console.error("❌ No token found in localStorage");
        return;
      }

      const response = await apiService.getSupportTickets();
      console.log("📡 API Response:", response);

      if (response.success) {
        console.log(`✅ Fetched ${response.data.length} tickets`);
        setTickets(response.data);
      } else {
        console.error("❌ API returned success: false");
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch tickets:", error);
      console.error("Error details:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    if (!ticket.isRead) {
      try {
        await apiService.getSupportTicketById(ticket._id);
        // Update local state to mark as read
        setTickets((prev) =>
          prev.map((t) => (t._id === ticket._id ? { ...t, isRead: true } : t))
        );
      } catch (error) {
        console.error("Failed to mark ticket as read:", error);
      }
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Ticket List */}
      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Support Tickets</h1>
          <button
            onClick={fetchTickets}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No tickets found
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => handleTicketClick(ticket)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedTicket?._id === ticket._id ? "bg-blue-50" : ""
                } ${!ticket.isRead ? "bg-orange-50" : ""}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`font-semibold ${
                      !ticket.isRead ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {ticket.user?.firstName} {ticket.user?.lastName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(ticket.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{ticket.email}</div>
                <div className="text-sm text-gray-500 line-clamp-2">
                  {ticket.content}
                </div>
                {!ticket.isRead && (
                  <div className="mt-2">
                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Detail */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedTicket ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Message from {selectedTicket.user?.firstName}{" "}
                    {selectedTicket.user?.lastName}
                  </h2>
                  <div className="text-gray-600">{selectedTicket.email}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.content}
                </p>
              </div>

              {selectedTicket.attachments &&
                selectedTicket.attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                      Attachments
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedTicket.attachments.map((url, index) => (
                        <a
                          key={index}
                          href={`${API_URL}${url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <img
                            src={`${API_URL}${url}`}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a ticket to view details
          </div>
        )}
      </div>
    </div>
  );
}
