import React, { useState, useEffect } from "react";
import { ConsultationLead } from "../types";
import { Database, RefreshCw, Trash2, Search, Filter, Phone, Download, CheckCircle2, Clock, X, AlertCircle } from "lucide-react";

interface AdminLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLeadModal: React.FC<AdminLeadModalProps> = ({ isOpen, onClose }) => {
  const [leads, setLeads] = useState<ConsultationLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("전체");
  const [callLogCount, setCallLogCount] = useState<number>(0);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/consultations");
      const data = await res.json();
      if (data.success) {
        setLeads(data.data || []);
        setCallLogCount(data.callLogCount || 0);
      }
    } catch (e) {
      console.error("Failed to fetch leads:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeads();
    }
  }, [isOpen]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus as any } : lead))
        );
      }
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const deleteLead = async (id: string) => {
    if (!window.confirm("이 신청 내역을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/consultations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
      }
    } catch (e) {
      console.error("Delete lead error:", e);
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "성함", "연락처", "서비스구분", "지역/위치", "희망시간", "상태", "신청시각"];
    const rows = leads.map((l) => [
      l.id,
      l.name,
      l.phone,
      l.serviceType,
      l.location,
      l.preferredTime,
      l.status,
      new Date(l.createdAt).toLocaleString("ko-KR"),
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `consultations_db_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.includes(searchTerm) ||
      l.phone.includes(searchTerm) ||
      l.location.includes(searchTerm);
    const matchesStatus = statusFilter === "전체" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = leads.filter((l) => l.status === "상담대기").length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                실시간 상담 신청 DB 현황 (링크커넥트 CPA)
              </h2>
              <p className="text-xs text-slate-500">
                웹페이지를 통해 접수된 실시간 고객 DB 리스트 및 상태 관리
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CPA Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-center">
            <div className="text-xs font-bold text-blue-700">총 접수 DB</div>
            <div className="text-2xl font-black text-blue-900 mt-1">{leads.length}건</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-center">
            <div className="text-xs font-bold text-amber-700">상담대기 (신규)</div>
            <div className="text-2xl font-black text-amber-900 mt-1">{pendingCount}건</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-center">
            <div className="text-xs font-bold text-emerald-700">상담 완료</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">
              {leads.filter((l) => l.status === "상담완료").length}건
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl text-center">
            <div className="text-xs font-bold text-indigo-700">전화 연결 클릭 (CPA)</div>
            <div className="text-2xl font-black text-indigo-900 mt-1">{callLogCount}회</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="성함, 연락처, 지역 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {["전체", "상담대기", "상담완료", "부재중", "취소"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === st ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchLeads}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
              title="새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={exportCSV}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV 내보내기</span>
            </button>
          </div>
        </div>

        {/* Lead Table */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold">접수된 상담 내역이 없습니다.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-3">신청시각</th>
                  <th className="p-3">성함</th>
                  <th className="p-3">연락처</th>
                  <th className="p-3">희망 서비스</th>
                  <th className="p-3">지역</th>
                  <th className="p-3">상태</th>
                  <th className="p-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleTimeString("ko-KR", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3 font-extrabold">{lead.name}</td>
                    <td className="p-3 text-blue-600 font-bold font-mono">
                      <a href={`tel:${lead.phone}`} className="hover:underline">
                        {lead.phone}
                      </a>
                    </td>
                    <td className="p-3">{lead.serviceType}</td>
                    <td className="p-3 text-slate-600">{lead.location}</td>
                    <td className="p-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`px-2 py-1 rounded font-bold text-xs border ${
                          lead.status === "상담대기"
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : lead.status === "상담완료"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-slate-100 text-slate-600 border-slate-300"
                        }`}
                      >
                        <option value="상담대기">상담대기</option>
                        <option value="상담완료">상담완료</option>
                        <option value="부재중">부재중</option>
                        <option value="취소">취소</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>* 실시간 상담 신청 데이터는 새로고침 버튼으로 동기화 가능합니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
