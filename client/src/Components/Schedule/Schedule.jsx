import React, { useEffect, useState } from "react";
import { Calendar, Clock, Pencil, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import QRScannerModal from "./QRScannerModal";
import api from "../../utils/api";

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [scannedData, setScannedData] = useState("");

  useEffect(() => {
    api.get("/events")
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const handleScan = (qrValue) => {
    console.log("✅ QR VALUE:", qrValue);
    setScannedData(qrValue);
    setShowScanner(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Event Schedule</h1>
        <div className="bg-gray-800 px-4 py-2 rounded-lg text-sm">
          Total Events:{" "}
          <span className="text-purple-400 font-semibold">
            {events.length}
          </span>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-400">No events available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.event_id}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition"
            >
              <Link to={`/schedule/event/${event.event_id}`}>
                <h2 className="text-2xl text-purple-400 font-semibold flex items-center gap-2 mb-4">
                  <Calendar size={22} />
                  {event.event_name}
                </h2>
              </Link>

              <div className="space-y-2 text-gray-300">
                <p className="flex items-center gap-2">
                  <Clock size={16} className="text-green-400" />
                  Start: {new Date(event.start_date).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} className="text-red-400" />
                  End: {new Date(event.end_date).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-4">
                <Link
                  to={`/schedule/edit/${event.event_id}`}
                  className="flex items-center gap-2 bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  <Pencil size={16} />
                  Edit
                </Link>

                <button
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowScanner(true);
                  }}
                  className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <QrCode size={16} />
                  Scan Me
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showScanner && (
        <QRScannerModal
          onClose={() => setShowScanner(false)}
          onScan={handleScan}
        />
      )}
    </div>
  );
}
