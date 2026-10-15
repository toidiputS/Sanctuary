import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  Calendar,
  CheckCircle2,
  Clock,
  Video,
  Bell,
  BellOff,
  AlertTriangle,
  FileText,
  UploadCloud,
  X,
  MapPin,
  User,
  Edit2,
  Check,
  Plus,
  Compass,
  PhoneCall,
  MessageSquare,
  FileCheck,
  Volume2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPinned,
  Send,
  Lock,
  RefreshCw,
  Download,
  TrendingUp,
  BarChart3,
  Activity,
  Award,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal,
  PiggyBank,
  Coins,
  Trophy,
  Flame,
  Heart,
  Moon,
  Sun
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

// Types
interface Meeting {
  id: string;
  name: string;
  day: string;
  dateStr: string;
  timeStr: string;
  status: "VERIFIED" | "PENDING" | "ABSENT";
  mandatory: boolean;
}

interface CheckIn {
  id: string;
  timestamp: string;
  locationName: string;
  coordinates: string;
  status: string;
}

interface Proof {
  id: string;
  fileName: string;
  uploadedAt: string;
  fileSize: string;
}

interface ProgressReport {
  id: string;
  title: string;
  generatedAt: string;
  recipientName: string;
  recipientEmail: string;
  status: "SENT" | "DRAFT" | "VERIFIED BY COURT";
  streakAtTime: number;
  meetingsChecked: number;
  totalMeetingsCount: number;
  gpsPingsCount: number;
  proofsCount: number;
  personalNotes: string;
  securityHash: string;
  securePasscode?: string;
  includeMeetingsLog: boolean;
  includeGPSLog: boolean;
  includeProofsLog: boolean;
}

const parseCoordinates = (coordStr: string): { lat: number; lng: number } => {
  try {
    const cleanStr = coordStr.replace(/[^\d\.,\-]/g, ""); // keep only numbers, dots, commas, minus
    const parts = cleanStr.split(",");
    if (parts.length >= 2) {
      let lat = parseFloat(parts[0]);
      let lng = parseFloat(parts[1]);
      // If original string had W, negate longitude
      if (coordStr.toUpperCase().includes("W") && lng > 0) {
        lng = -lng;
      }
      if (coordStr.toUpperCase().includes("S") && lat > 0) {
        lat = -lat;
      }
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  } catch (e) {
    console.error("Error parsing coordinates:", e);
  }
  return { lat: 47.6062, lng: -122.3321 }; // Fallback Seattle coordinates
};

export default function App() {
  // State Initialization
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("sanctuary_userName") || "Marcus";
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem("sanctuary_streak");
    return saved ? parseInt(saved) : 142;
  });

  const [complianceStatus, setComplianceStatus] = useState<"Compliant" | "Review Pending" | "Urgent Alert">("Compliant");

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("sanctuary_dark_mode");
    if (saved !== null) {
      return saved === "true";
    }
    return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    localStorage.setItem("sanctuary_dark_mode", isDarkMode ? "true" : "false");
  }, [isDarkMode]);

  // Bottom Navigation tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "reports" | "resources" | "support" | "charts">("dashboard");

  // Call schedule states
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: "meet-1",
      name: "Noon Affirmations Circle",
      day: "Mon Oct 23",
      dateStr: "Monday, Oct 23",
      timeStr: "12:00 PM - 1:00 PM",
      status: "VERIFIED",
      mandatory: true,
    },
    {
      id: "meet-2",
      name: "Evening Recovery Circle",
      day: "Tue Oct 24",
      dateStr: "Tuesday, Oct 24",
      timeStr: "7:00 PM - 8:00 PM",
      status: "VERIFIED", // Matches the "2 / 3 completed" in original mock, but we'll let user toggle or join
      mandatory: true,
    },
    {
      id: "meet-3",
      name: "Weekend Sanctuary Gathering",
      day: "Thu Oct 26",
      dateStr: "Thursday, Oct 26",
      timeStr: "8:00 PM - 9:00 PM",
      status: "PENDING",
      mandatory: true,
    }
  ]);

  // Geolocation Check-in states
  const [checkInLogs, setCheckInLogs] = useState<CheckIn[]>(() => {
    const saved = localStorage.getItem("sanctuary_checkins");
    return saved ? JSON.parse(saved) : [
      {
        id: "check-1",
        timestamp: "Today, 10:15 AM",
        locationName: "Registered Residence (Home Zone)",
        coordinates: "47.6062° N, 122.3321° W",
        status: "Verified by Live GPS"
      },
      {
        id: "check-2",
        timestamp: "Yesterday, 12:45 PM",
        locationName: "Sanctuary Treatment Center",
        coordinates: "47.6101° N, 122.3420° W",
        status: "Verified by Live GPS"
      },
      {
        id: "check-3",
        timestamp: "3 days ago, 02:15 PM",
        locationName: "Support Group Counseling Office",
        coordinates: "47.6042° N, 122.3290° W",
        status: "Verified by Live GPS"
      },
      {
        id: "check-4",
        timestamp: "5 days ago, 09:00 AM",
        locationName: "Municipal Court Compliance Area",
        coordinates: "47.6080° N, 122.3350° W",
        status: "Verified by Network"
      },
      {
        id: "check-5",
        timestamp: "12 days ago, 08:30 PM",
        locationName: "Registered Residence (Home Zone)",
        coordinates: "47.6062° N, 122.3321° W",
        status: "Verified by Live GPS"
      },
      {
        id: "check-6",
        timestamp: "18 days ago, 04:30 PM",
        locationName: "Sodo Community Recovery Center",
        coordinates: "47.5980° N, 122.3300° W",
        status: "Verified by Network"
      },
      {
        id: "check-7",
        timestamp: "24 days ago, 11:15 AM",
        locationName: "Registered Residence (Home Zone)",
        coordinates: "47.6062° N, 122.3321° W",
        status: "Verified by Live GPS"
      },
      {
        id: "check-8",
        timestamp: "28 days ago, 03:00 PM",
        locationName: "Sanctuary Treatment Center",
        coordinates: "47.6101° N, 122.3420° W",
        status: "Verified by Live GPS"
      }
    ];
  });
  const [selectedLogId, setSelectedLogId] = useState<string | null>("check-1");
  const [mapTimeframe, setMapTimeframe] = useState<"7days" | "30days">("30days");
  const [mapZoneFilter, setMapZoneFilter] = useState<"all" | "home" | "treatment" | "other">("all");
  const [mapScale, setMapScale] = useState<number>(1);
  const [isLocating, setIsLocating] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(() => {
    return localStorage.getItem("sanctuary_checked_in_today") === "true";
  });
  const [checkInLocation, setCheckInLocation] = useState<string>("");

  // File Upload states
  const [uploadedProofs, setUploadedProofs] = useState<Proof[]>(() => {
    const saved = localStorage.getItem("sanctuary_proofs");
    return saved ? JSON.parse(saved) : [
      {
        id: "proof-1",
        fileName: "Oct Week 3 Certificate.pdf",
        uploadedAt: "Oct 21, 2026, 3:15 PM",
        fileSize: "1.2 MB"
      }
    ];
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Zoom Meeting Simulation Overlay
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomTimer, setZoomTimer] = useState(0);
  const [zoomChat, setZoomChat] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: "Sponsor Dave", text: "Welcome everyone, let's take a deep breath to start.", time: "7:00 PM" },
    { sender: "Sophia K.", text: "Keep pushing, Marcus! Proud of your 142 days streak.", time: "7:02 PM" },
    { sender: "Counselor Claire", text: "Today we are focusing on personal grounding. Breathe with the circle in the center.", time: "7:04 PM" }
  ]);
  const [newChatMsg, setNewChatMsg] = useState("");
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingProgress, setBreathingProgress] = useState(0); // 0 to 100 for scaling

  // Notification toggles
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  // Emergency Modal
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progress Reports states
  const [reports, setReports] = useState<ProgressReport[]>(() => {
    const saved = localStorage.getItem("sanctuary_reports");
    return saved ? JSON.parse(saved) : [
      {
        id: "REP-2026-10-24-01",
        title: "Compliance & Treatment Progress Report",
        generatedAt: "Oct 24, 2026, 04:30 PM",
        recipientName: "Hon. Judge Elena Rosales",
        recipientEmail: "e.rosales@superiorcourt.gov",
        status: "VERIFIED BY COURT",
        streakAtTime: 142,
        meetingsChecked: 2,
        totalMeetingsCount: 3,
        gpsPingsCount: 2,
        proofsCount: 1,
        personalNotes: "Marcus has been fully compliant with all court-mandated Zoom meetings. He has been highly active in group discussions and is displaying outstanding personal ownership in his recovery.",
        securityHash: "sha256-8a7e4b931dc0b4d49a421b83cc94",
        includeMeetingsLog: true,
        includeGPSLog: true,
        includeProofsLog: true
      }
    ];
  });

  const [newReportTitle, setNewReportTitle] = useState("Weekly Compliance & Treatment Progress");
  const [selectedRecipientKey, setSelectedRecipientKey] = useState("judge-rosales");
  const [customRecipientName, setCustomRecipientName] = useState("");
  const [customRecipientEmail, setCustomRecipientEmail] = useState("");
  const [includeMeetingsLog, setIncludeMeetingsLog] = useState(true);
  const [includeGPSLog, setIncludeGPSLog] = useState(true);
  const [includeProofsLog, setIncludeProofsLog] = useState(true);
  const [personalNotes, setPersonalNotes] = useState("I am staying fully dedicated to my recovery program. Participating in the circles has helped me maintain solid structure.");
  const [securePasscode, setSecurePasscode] = useState("");
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [sendingStep, setSendingStep] = useState("");
  const [selectedPreviewReport, setSelectedPreviewReport] = useState<ProgressReport | null>(null);

  // Charts & Analytics States
  const [chartTimeframe, setChartTimeframe] = useState<"7" | "14" | "30">("30");
  const [chartZoneFilter, setChartZoneFilter] = useState<string>("all");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState("");
  const [auditProgress, setAuditProgress] = useState(0);
  const [showAuditCertificate, setShowAuditCertificate] = useState(false);
  const [generatedAuditHash, setGeneratedAuditHash] = useState("");

  // Hamified Gamification States
  const [hamCoins, setHamCoins] = useState<number>(() => {
    const saved = localStorage.getItem("sanctuary_ham_coins");
    return saved ? parseInt(saved) : 15;
  });

  const [redeemedRewards, setRedeemedRewards] = useState<string[]>(() => {
    const saved = localStorage.getItem("sanctuary_redeemed_rewards");
    return saved ? JSON.parse(saved) : [];
  });

  // Grounding wizard state
  const [groundingStep, setGroundingStep] = useState<number>(0); // 0 = start, 1 = see, 2 = touch, 3 = hear, 4 = smell, 5 = taste, 6 = complete
  const [groundingInputs, setGroundingInputs] = useState({
    see: ["", "", "", "", ""],
    touch: ["", "", "", ""],
    hear: ["", "", ""],
    smell: ["", ""],
    taste: [""]
  });

  // Guided breathing states
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingSessionPhase, setBreathingSessionPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingTick, setBreathingTick] = useState(0); // 0 to 4 seconds
  const [breathCount, setBreathCount] = useState(0);

  // Soundscape
  const [isBaconAudioPlaying, setIsBaconAudioPlaying] = useState(false);

  // Persist Hamified Gamification
  useEffect(() => {
    localStorage.setItem("sanctuary_ham_coins", hamCoins.toString());
  }, [hamCoins]);

  useEffect(() => {
    localStorage.setItem("sanctuary_redeemed_rewards", JSON.stringify(redeemedRewards));
  }, [redeemedRewards]);

  // Guided breathing simulation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathingTick((prev) => {
          const next = prev + 1;
          if (next >= 4) {
            // cycle phase
            setBreathingSessionPhase((currPhase) => {
              if (currPhase === "Inhale") return "Hold";
              if (currPhase === "Hold") return "Exhale";
              
              // Completed a full breath!
              setBreathCount((c) => {
                const isGoldenAppleEnabled = redeemedRewards.includes("golden_apple");
                const nextCount = c + 1;
                if (nextCount >= 5) {
                  setIsBreathingActive(false);
                  const reward = isGoldenAppleEnabled ? 20 : 10;
                  setHamCoins((prevCoins) => prevCoins + reward);
                  showToast(`Oink! Breathing session completed. +${reward} Ham Coins! 🐽`);
                  return 0;
                }
                return nextCount;
              });
              return "Inhale";
            });
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      setBreathingTick(0);
      setBreathingSessionPhase("Inhale");
      setBreathCount(0);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, redeemedRewards]);

  // Persist logs and settings
  useEffect(() => {
    localStorage.setItem("sanctuary_reports", JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem("sanctuary_proofs", JSON.stringify(uploadedProofs));
  }, [uploadedProofs]);

  useEffect(() => {
    localStorage.setItem("sanctuary_checkins", JSON.stringify(checkInLogs));
  }, [checkInLogs]);

  useEffect(() => {
    localStorage.setItem("sanctuary_checked_in_today", checkedInToday ? "true" : "false");
  }, [checkedInToday]);

  // Breathing circle simulation inside virtual call
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showZoomModal) {
      interval = setInterval(() => {
        setZoomTimer((prev) => prev + 1);
        
        // Cycle breathing phase every 4 seconds
        setBreathingProgress((progress) => {
          if (progress >= 100) {
            setBreathingPhase((phase) => {
              if (phase === "Inhale") return "Hold";
              if (phase === "Hold") return "Exhale";
              return "Inhale";
            });
            return 0;
          }
          return progress + 2.5; // smooth step
        });
      }, 100);
    } else {
      setZoomTimer(0);
    }
    return () => clearInterval(interval);
  }, [showZoomModal]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName);
      localStorage.setItem("sanctuary_userName", tempName);
      setIsEditingName(false);
      showToast(`Welcome back, ${tempName}! Header updated.`);
    }
  };

  const handleIncrementStreak = () => {
    const newStreak = streakDays + 1;
    setStreakDays(newStreak);
    localStorage.setItem("sanctuary_streak", newStreak.toString());
    showToast(`Incredible effort! Day ${newStreak} logged.`);
  };

  // Simulated GPS Check-in
  const handleLocationCheckIn = () => {
    if (checkedInToday) {
      showToast("Your registered residence location has already been verified for today.");
      return;
    }

    setIsLocating(true);
    showToast("Requesting device GPS coordinates to cross-reference registered zones...");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            const lat = position.coords.latitude.toFixed(4);
            const lng = position.coords.longitude.toFixed(4);
            const newLog: CheckIn = {
              id: `check-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Today)",
              locationName: "Registered Treatment & Housing Area",
              coordinates: `${lat}° N, ${lng}° W`,
              status: "Verified by Live GPS"
            };

            setCheckInLogs([newLog, ...checkInLogs]);
            setCheckedInToday(true);
            setIsLocating(false);
            setComplianceStatus("Compliant");
            showToast("GPS Coordinate Match: Check-in successfully submitted and logged.");
          }, 1500);
        },
        (error) => {
          // Fallback if Geolocation is blocked/not allowed in iframe
          setTimeout(() => {
            const newLog: CheckIn = {
              id: `check-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Today)",
              locationName: "Registered Residence (Cell Tower Triangulation)",
              coordinates: "47.6062° N, 122.3321° W (Standard Home)",
              status: "Verified by Network"
            };

            setCheckInLogs([newLog, ...checkInLogs]);
            setCheckedInToday(true);
            setIsLocating(false);
            setComplianceStatus("Compliant");
            showToast("Network Check-in complete: Location verified successfully.");
          }, 1500);
        }
      );
    } else {
      setIsLocating(false);
      showToast("Geolocation not supported by browser. Verified by alternative network fallback.");
    }
  };

  // Drag and Drop File Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate real upload progress bar
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newProof: Proof = {
              id: `proof-${Date.now()}`,
              fileName: file.name,
              uploadedAt: new Date().toLocaleDateString([], { month: 'short', day: '2-digit' }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              fileSize: (file.size / (1024 * 1024)).toFixed(1) + " MB"
            };
            setUploadedProofs([newProof, ...uploadedProofs]);
            setIsUploading(false);
            showToast(`Proof certificate "${file.name}" uploaded successfully.`);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleJoinCircle = () => {
    setShowZoomModal(true);
  };

  const handleLeaveCircle = () => {
    setShowZoomModal(false);
    // Mark Tuesday's recovery circle as VERIFIED upon leaving
    const updated = meetings.map((m) => {
      if (m.id === "meet-2") {
        return { ...m, status: "VERIFIED" as const };
      }
      return m;
    });
    setMeetings(updated);
    showToast("Recovery Circle session logged. Tuesday meeting verified.");
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChatMsg.trim()) {
      setZoomChat([
        ...zoomChat,
        {
          sender: "Marcus (You)",
          text: newChatMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setNewChatMsg("");
    }
  };

  const toggleMeetingStatus = (id: string) => {
    const updated = meetings.map((m) => {
      if (m.id === id) {
        const nextStatus = m.status === "VERIFIED" ? "PENDING" : "VERIFIED";
        return { ...m, status: nextStatus };
      }
      return m;
    });
    setMeetings(updated);
    showToast("Attendance log status updated manually.");
  };

  const getRecipientDetails = () => {
    if (selectedRecipientKey === "judge-rosales") {
      return { name: "Hon. Judge Elena Rosales", email: "e.rosales@superiorcourt.gov" };
    } else if (selectedRecipientKey === "officer-ramirez") {
      return { name: "Probation Officer Ramirez", email: "p.ramirez@probation.county.gov" };
    } else if (selectedRecipientKey === "counselor-sterling") {
      return { name: "Dr. Claire Sterling, LMFT", email: "c.sterling@recoverycenter.org" };
    } else {
      return {
        name: customRecipientName || "Custom Recipient",
        email: customRecipientEmail || "portal.upload@courts.state.gov"
      };
    }
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = getRecipientDetails();
    
    setIsSendingReport(true);
    setSendingStep("Generating secure report document structure...");
    
    setTimeout(() => {
      setSendingStep("Scanning and appending verified meeting attendance logs...");
      
      setTimeout(() => {
        setSendingStep("Validating daily GPS coordinate secure pings...");
        
        setTimeout(() => {
          setSendingStep("Signing report cryptographically with device SHA-256 key...");
          
          setTimeout(() => {
            setSendingStep("Transmitting securely via encrypted State Court portal...");
            
            setTimeout(() => {
              const hashChars = "0123456789abcdef";
              let generatedHash = "sha256-";
              for (let i = 0; i < 24; i++) {
                generatedHash += hashChars[Math.floor(Math.random() * 16)];
              }

              const newReport: ProgressReport = {
                id: `REP-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
                title: newReportTitle || "Compliance & Treatment Progress Report",
                generatedAt: new Date().toLocaleString([], { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                recipientName: recipient.name,
                recipientEmail: recipient.email,
                status: "SENT",
                streakAtTime: streakDays,
                meetingsChecked: includeMeetingsLog ? completedMeetingsCount : 0,
                totalMeetingsCount: includeMeetingsLog ? meetings.length : 0,
                gpsPingsCount: includeGPSLog ? checkInLogs.length : 0,
                proofsCount: includeProofsLog ? uploadedProofs.length : 0,
                personalNotes: personalNotes,
                securityHash: generatedHash,
                securePasscode: securePasscode || undefined,
                includeMeetingsLog,
                includeGPSLog,
                includeProofsLog
              };

              setReports([newReport, ...reports]);
              setIsSendingReport(false);
              setSendingStep("");
              // Reset some fields
              setSecurePasscode("");
              showToast(`Report securely sent to ${recipient.name}!`);
            }, 1000);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleDeleteReport = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    if (selectedPreviewReport?.id === id) {
      setSelectedPreviewReport(null);
    }
    showToast("Report archive record removed.");
  };

  const handleDownloadReport = (report: ProgressReport) => {
    showToast(`Downloading secure encrypted report file: ${report.id}`);
    const docContent = `===========================================================
      DAILY SANCTUARY COURT COMPLIANCE PROGRESS REPORT
===========================================================
Report Reference: ${report.id}
Date Generated: ${report.generatedAt}
Compliance Streak: Day ${report.streakAtTime}
Current Status: Compliant

RECIPIENT INFO:
---------------
Name: ${report.recipientName}
Secure Portal / Email: ${report.recipientEmail}

DEFENDANT DETAIL:
-----------------
Full Name: ${userName}
Assigned Case ID: District-441-26

VERIFIED COMPLIANCE METRICS:
----------------------------
* Consecutive Days Streak: ${report.streakAtTime} Days
* Meeting Attendance: ${report.includeMeetingsLog ? `${report.meetingsChecked} / ${report.totalMeetingsCount} Meetings Verified` : 'Excluded'}
* Secure GPS Pings Logged: ${report.includeGPSLog ? `${report.gpsPingsCount} coordinates verified` : 'Excluded'}
* Treatment Proof Files: ${report.includeProofsLog ? `${report.proofsCount} formal certificate uploads` : 'Excluded'}

PERSONAL REFLECTION & COMPLIANCE STATEMENT:
-------------------------------------------
"${report.personalNotes}"

-----------------------------------------------------------
AUTHENTICITY SEAL & CRYPTOGRAPHIC SIGN-OFF:
-----------------------------------------------------------
[X] Defendant Digital Sign-off: ${userName}
[X] Secure Cryptographic Signature Hash: ${report.securityHash}
[X] Verification System State: PORTAL TRANSMISSION COMPLIANT

Any unauthorized modification of this document invalidates the secure signature hash.
For court verification queries, contact support@dailysanctuary.org.
===========================================================`;

    const blob = new Blob([docContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Sanctuary_Compliance_Report_${report.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 30-Day compliance charts helper functions
  const generate30DayData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayOfWeek = d.getDay();
      
      // Meetings schedule mapping
      const isMeetingDay = dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4; // Mon, Tue, Thu
      const meetingsScheduled = isMeetingDay ? 1 : 0;
      let meetingsAttended = meetingsScheduled;
      
      // If user toggles standard meetings, let's inject them dynamically for the last few days
      if (i === 0 && isMeetingDay) {
        meetingsAttended = completedMeetingsCount > 0 ? 1 : 0;
      }
      
      // GPS requirements
      const gpsRequired = (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 2;
      let gpsLogged = gpsRequired;
      
      // Count actual user check-ins on this specific date
      let actualUserCheckinsOnDay = 0;
      checkInLogs.forEach(log => {
        const ts = log.timestamp.toLowerCase();
        const isTodayCheck = i === 0 && (ts.includes("today") || ts.includes("just now") || ts.includes("seconds ago"));
        const isYesterdayCheck = i === 1 && ts.includes("yesterday");
        const isDateMatch = ts.includes(dateLabel.toLowerCase());
        if (isTodayCheck || isYesterdayCheck || isDateMatch) {
          actualUserCheckinsOnDay++;
        }
      });
      
      if (actualUserCheckinsOnDay > 0) {
        gpsLogged = actualUserCheckinsOnDay;
      }
      
      const streakOnDay = Math.max(1, streakDays - i);
      
      // Calculate compliance score
      const complianceScore = meetingsScheduled > 0 
        ? Math.round(((meetingsAttended + gpsLogged) / (meetingsScheduled + gpsRequired)) * 100)
        : Math.round((gpsLogged / gpsRequired) * 100);
        
      data.push({
        date: dateLabel,
        meetingsScheduled,
        meetingsAttended,
        gpsRequired,
        gpsLogged,
        streak: streakOnDay,
        compliance: Math.min(100, complianceScore),
      });
    }
    
    return data;
  };

  const getZoneDistribution = () => {
    const counts: Record<string, number> = {
      "Home Zone": 18,
      "Treatment Center": 8,
      "Counseling Office": 4,
    };
    
    checkInLogs.forEach(log => {
      let zone = "Other Zone";
      if (log.locationName.includes("Home") || log.locationName.includes("Residence")) {
        zone = "Home Zone";
      } else if (log.locationName.includes("Treatment") || log.locationName.includes("Sanctuary")) {
        zone = "Treatment Center";
      } else if (log.locationName.includes("Counseling") || log.locationName.includes("Sterling")) {
        zone = "Counseling Office";
      } else {
        zone = log.locationName.split(" ")[0] || "Custom Zone";
      }
      counts[zone] = (counts[zone] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditProgress(0);
    setShowAuditCertificate(false);
    setAuditStep("Initializing compliance verification scanner...");
    
    setTimeout(() => {
      setAuditProgress(25);
      setAuditStep("Decrypting and cross-checking zoom attendance logs...");
      
      setTimeout(() => {
        setAuditProgress(50);
        setAuditStep("Acquiring securely signed device GPS geofence keys...");
        
        setTimeout(() => {
          setAuditProgress(75);
          setAuditStep("Matching metadata hashes against state database...");
          
          setTimeout(() => {
            setAuditProgress(100);
            setAuditStep("Generating digital seal certificate...");
            
            setTimeout(() => {
              const hashChars = "abcdef0123456789";
              let hash = "SHA-256:";
              for (let i = 0; i < 32; i++) {
                hash += hashChars[Math.floor(Math.random() * 16)];
              }
              setGeneratedAuditHash(hash);
              setIsAuditing(false);
              setShowAuditCertificate(true);
              showToast("Pre-Court audit completed. Certificate issued.");
            }, 600);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  // Helper calculation for completed meetings
  const completedMeetingsCount = meetings.filter((m) => m.status === "VERIFIED").length;

  return (
    <div className={`flex flex-col min-h-screen w-full transition-colors duration-300 font-sans p-4 md:p-8 space-y-6 ${
      isDarkMode 
        ? "bg-[#121411] text-[#e3e6de]" 
        : "bg-[#f5f5f0] text-earth-dark"
    }`}>
      
      {/* Toast Notification Box */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#5A5A40] dark:bg-[#252b20] text-white px-6 py-3 rounded-2xl shadow-xl flex items-center space-x-3 border border-olive-200 dark:border-[#384232] animate-bounce duration-300">
          <div className="w-2 h-2 bg-sage-500 rounded-full animate-ping"></div>
          <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-[#D1D1C4] dark:border-[#2f3529] pb-6 space-y-4 md:space-y-0">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-4xl font-serif font-bold text-olive-500 dark:text-[#d2dbca] tracking-tight">Daily Sanctuary</h1>
            <div className="p-1.5 bg-[#EBEBE3] dark:bg-[#252b21] rounded-full text-olive-500 dark:text-sage-300 hover:bg-olive-200 dark:hover:bg-[#2f3729] transition-colors cursor-pointer" title="Increment Days Streak" onClick={handleIncrementStreak}>
              <Sparkles className="w-4 h-4 text-sage-500 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center space-x-2 group">
            {isEditingName ? (
              <div className="flex items-center space-x-2 bg-white/60 dark:bg-[#1a1e17]/80 p-1 rounded-xl border border-olive-300 dark:border-[#384232]">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="px-2 py-0.5 bg-transparent font-serif italic text-lg text-earth-dark dark:text-[#e3e6de] outline-none border-b border-olive-400 dark:border-sage-500 w-32 focus:border-olive-500"
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-1 hover:bg-olive-100 dark:hover:bg-[#282f23] rounded text-sage-500">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setIsEditingName(false)} className="p-1 hover:bg-olive-100 dark:hover:bg-[#282f23] rounded text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-lg opacity-80 italic font-serif flex items-center flex-wrap gap-1 text-earth-dark dark:text-[#c5cbbe]">
                  {redeemedRewards.includes("porktrait_frame") && <span className="animate-bounce">👑</span>}
                  Good afternoon, <span className={redeemedRewards.includes("porktrait_frame") ? "text-rose-600 dark:text-rose-400 font-bold border-b-2 border-dashed border-rose-300" : ""}>{userName}</span>
                  {redeemedRewards.includes("porktrait_frame") && <span className="text-rose-400 font-bold text-sm">🐽</span>}. One day at a time.
                </p>
                <button
                  onClick={() => {
                    setTempName(userName);
                    setIsEditingName(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#EBEBE3] dark:hover:bg-[#252b21] rounded-lg transition-all duration-200"
                  title="Rename Profile"
                >
                  <Edit2 className="w-3.5 h-3.5 text-earth-muted dark:text-[#888e7f]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Top Badges & Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
          {/* Status Badge */}
          <div className="bg-white dark:bg-[#1a1e17] px-5 py-2.5 rounded-full shadow-sm border border-[#E8E8E1] dark:border-[#2f3529] flex items-center">
            <div className="relative flex mr-3">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-sage-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-500"></span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-earth-dark dark:text-[#d3d8cb]">
              Status: <span className="text-olive-500 dark:text-sage-300">{complianceStatus}</span>
            </span>
          </div>

          {/* Streak Counter */}
          <div 
            onClick={handleIncrementStreak}
            className="bg-olive-500 dark:bg-sage-600 text-white px-5 py-2.5 rounded-full shadow-sm hover:bg-olive-600 dark:hover:bg-sage-700 transition-all duration-300 flex items-center space-x-2 cursor-pointer group active:scale-95"
            title="Click to increment your streak!"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Day {streakDays}</span>
            <Plus className="w-3.5 h-3.5 text-sage-300 dark:text-sage-200 group-hover:rotate-90 transition-transform" />
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => {
              const nextMode = !isDarkMode;
              setIsDarkMode(nextMode);
              showToast(nextMode ? "🌙 Dark Sanctuary activated. Serene evening tones." : "☀️ Light Sanctuary activated. Natural daylight tones.");
            }}
            className="bg-white dark:bg-[#1a1e17] px-4 py-2.5 rounded-full shadow-sm border border-[#E8E8E1] dark:border-[#2f3529] hover:border-olive-300 dark:hover:border-sage-600 transition-all duration-300 flex items-center space-x-2 cursor-pointer group active:scale-95 text-xs font-bold text-earth-dark dark:text-[#d3d8cb]"
            title={isDarkMode ? "Switch to Light Sanctuary" : "Switch to Dark Sanctuary"}
            aria-label="Toggle dark mode theme"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform" />
                <span className="text-xs">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-olive-600 group-hover:-rotate-12 transition-transform" />
                <span className="text-xs">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Grid Swap based on Tabs */}
      {activeTab === "dashboard" && (
        <main className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Attendance & Schedule */}
          <section className="col-span-1 md:col-span-7 flex flex-col space-y-6">
            
            {/* Next Meeting Card */}
            <div className="bg-white dark:bg-[#1b1f18] rounded-[32px] p-6 md:p-8 shadow-sm border border-[#E8E8E1] dark:border-[#2f3529] flex flex-col justify-between h-auto md:h-64 card-hover-effect space-y-4 md:space-y-0 transition-colors duration-300">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#A3A392] dark:text-[#888e7f] mb-2 block">
                    Upcoming Mandatory Call
                  </span>
                  <h2 className="text-2xl md:text-3xl font-serif text-olive-500 dark:text-[#d2dbca]">
                    Evening Recovery Circle
                  </h2>
                  <p className="text-earth-muted dark:text-[#9ea396] text-sm md:text-base">
                    Tuesday, Oct 24 • 7:00 PM - 8:00 PM
                  </p>
                </div>

                <div className="bg-[#F9F9F7] dark:bg-[#20251c] p-3 rounded-2xl border border-[#F0F0EB] dark:border-[#2f3529] text-center w-24">
                  <span className="block text-[10px] uppercase font-bold text-earth-light dark:text-[#888e7f]">In</span>
                  <span className="block text-2xl font-serif text-olive-500 dark:text-[#d2dbca] font-bold">02</span>
                  <span className="block text-[10px] uppercase font-bold text-earth-light dark:text-[#888e7f]">Hours</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleJoinCircle}
                  className="flex-grow bg-olive-500 hover:bg-olive-600 dark:bg-sage-600 dark:hover:bg-sage-700 text-white py-3.5 md:py-4 rounded-2xl font-bold tracking-wide transition-all duration-200 flex justify-center items-center space-x-3 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
                >
                  <Video className="w-5 h-5 text-sage-200 animate-pulse" />
                  <span>JOIN ZOOM CALL</span>
                </button>

                <button
                  onClick={() => {
                    setRemindersEnabled(!remindersEnabled);
                    showToast(remindersEnabled ? "Reminders muted for this call." : "Notification alarms set for this call.");
                  }}
                  className={`p-3.5 md:p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                    remindersEnabled
                      ? "bg-sage-100 dark:bg-[#252e20] text-olive-500 dark:text-sage-300 border border-sage-200 dark:border-[#384430] hover:bg-sage-200 dark:hover:bg-[#2d3827]"
                      : "bg-[#F0F0EB] dark:bg-[#20251c] text-earth-light dark:text-[#7d8574] hover:bg-[#E8E8E1] dark:hover:bg-[#282f23]"
                  }`}
                  title={remindersEnabled ? "Mute Reminders" : "Enable Reminders"}
                >
                  {remindersEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Weekly Attendance Tracker */}
            <div className="bg-[#EBEBE3] dark:bg-[#20251c] rounded-[32px] p-6 md:p-8 flex flex-col justify-between space-y-4 transition-colors duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-xl text-olive-500 dark:text-[#d2dbca] font-bold">Weekly Attendance Goal</h3>
                  <p className="text-xs text-earth-muted dark:text-[#9ea396] mt-0.5">Click meeting cards to log/verify attendance</p>
                </div>
                <span className="text-xs font-bold text-olive-500 dark:text-sage-300 bg-white/70 dark:bg-[#1a1e17]/80 px-3.5 py-1.5 rounded-full border border-white/80 dark:border-[#2f3529]">
                  {completedMeetingsCount} / {meetings.length} COMPLETED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {meetings.map((meeting) => {
                  const isVerified = meeting.status === "VERIFIED";
                  return (
                    <div
                      key={meeting.id}
                      onClick={() => toggleMeetingStatus(meeting.id)}
                      className={`h-32 bg-white dark:bg-[#1a1e17] rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 select-none group border-2 ${
                        isVerified
                          ? "border-sage-500 dark:border-sage-500/80 shadow-sm hover:shadow-md"
                          : "border-dashed border-[#D1D1C4] dark:border-[#333b2c] bg-white/40 dark:bg-[#161a13] hover:bg-white dark:hover:bg-[#1a1e17]"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-bold uppercase ${isVerified ? "text-sage-500 dark:text-sage-400" : "text-earth-light dark:text-[#7d8574]"}`}>
                          {meeting.day}
                        </span>
                        {meeting.mandatory && (
                          <span className="text-[8px] bg-olive-100 dark:bg-[#252e20] text-olive-500 dark:text-sage-300 font-extrabold px-1.5 py-0.5 rounded">
                            REQ
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-xs font-serif font-bold text-olive-500 dark:text-[#d2dbca] line-clamp-1 group-hover:text-olive-600 dark:group-hover:text-white">
                          {meeting.name}
                        </span>
                        <span className="text-[10px] text-earth-muted dark:text-[#9ea396] block">
                          {meeting.timeStr.split(" - ")[0]}
                        </span>
                      </div>

                      <div className="flex items-center">
                        {isVerified ? (
                          <div className="flex items-center text-sage-500 dark:text-sage-400">
                            <CheckCircle2 className="w-4 h-4 mr-1 fill-sage-500 text-white dark:text-[#1a1e17]" />
                            <span className="text-[9px] font-bold tracking-wider">VERIFIED</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-earth-light dark:text-[#7d8574]">
                            <div className="w-2 h-2 rounded-full bg-earth-light dark:bg-[#7d8574] mr-2 animate-pulse"></div>
                            <span className="text-[9px] font-bold tracking-wider">PENDING</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Column: Compliance & Court */}
          <section className="col-span-1 md:col-span-5 flex flex-col space-y-6">
            
            {/* Legal Check-in Card */}
            <div className="bg-white dark:bg-[#1b1f18] rounded-[32px] p-6 md:p-8 shadow-sm border border-[#E8E8E1] dark:border-[#2f3529] flex flex-col justify-between flex-grow card-hover-effect space-y-6 transition-colors duration-300">
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 pb-2 border-b border-olive-100 dark:border-[#2f3529]">
                  <div className="p-3 bg-olive-50 dark:bg-[#252b21] rounded-2xl text-olive-500 dark:text-sage-300">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-olive-500 dark:text-[#d2dbca]">Court Compliance</h3>
                    <p className="text-xs text-earth-muted dark:text-[#9ea396]">Case ref: District-441-26</p>
                  </div>
                </div>

                <div className="space-y-5">
                  
                  {/* Supervising Officer Block */}
                  <div className="pb-4 border-b border-olive-100 dark:border-[#2f3529]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#A3A392] dark:text-[#888e7f] mb-1">
                      Supervising Officer
                    </p>
                    <p className="font-serif text-lg font-semibold text-olive-500 dark:text-[#d2dbca]">
                      Hon. Judge Elena Rosales
                    </p>
                    <p className="text-sm text-earth-muted dark:text-[#9ea396]">
                      Superior Court District 4 • Officer Ramirez
                    </p>
                  </div>

                  {/* Daily GPS Status Check */}
                  <div className="bg-[#F9F9F7] dark:bg-[#20251c] p-4 rounded-2xl border border-[#F0F0EB] dark:border-[#2f3529] space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#A3A392] dark:text-[#888e7f]">
                        Daily Location Status
                      </p>
                      {checkedInToday ? (
                        <span className="text-[9px] bg-sage-500 text-white px-2 py-0.5 rounded font-extrabold flex items-center">
                          <Check className="w-2.5 h-2.5 mr-0.5" /> SECURE
                        </span>
                      ) : (
                        <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-extrabold animate-pulse">
                          REQUIRED TODAY
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-earth-muted dark:text-[#9ea396] leading-relaxed">
                      Confirm you are currently located at your registered residence zone for verification compliance.
                    </p>
                    
                    <button
                      onClick={handleLocationCheckIn}
                      disabled={isLocating}
                      className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider transition-all duration-300 flex justify-center items-center space-x-2 ${
                        checkedInToday
                          ? "bg-sage-100 dark:bg-[#252e20] text-sage-600 dark:text-sage-400 border border-sage-200 dark:border-[#384430] cursor-not-allowed"
                          : "bg-sage-500 hover:bg-sage-600 dark:bg-sage-600 dark:hover:bg-sage-700 text-white active:scale-[0.98] shadow-sm cursor-pointer"
                      }`}
                    >
                      {isLocating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>CROSS-REFERENCING GPS...</span>
                        </>
                      ) : checkedInToday ? (
                        <>
                          <Check className="w-4 h-4 text-sage-500 dark:text-sage-400" />
                          <span>LOCATION VERIFIED TODAY</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 text-white animate-bounce" />
                          <span>LOG LOCATION CHECK-IN</span>
                        </>
                      )}
                    </button>

                    {checkedInToday && checkInLogs.length > 0 && (
                      <p className="text-[9px] text-center text-sage-600 dark:text-sage-400 italic font-medium">
                        Last ping: {checkInLogs[0].timestamp} • {checkInLogs[0].coordinates}
                      </p>
                    )}
                  </div>

                  {/* Drag & Drop Proof Upload Container */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                      dragActive
                        ? "border-sage-500 bg-sage-100/50 dark:bg-[#252f21]"
                        : "border-dashed border-olive-200 dark:border-[#333b2c] bg-[#F9F9F7] dark:bg-[#20251c] hover:bg-white dark:hover:bg-[#1a1e17]"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A3A392] dark:text-[#888e7f]">
                          Treatment Proof Certificate
                        </p>
                        <p className="text-xs font-serif text-olive-500 dark:text-[#d2dbca] mt-0.5 font-medium">
                          {uploadedProofs.length > 0 ? uploadedProofs[0].fileName : "No certificates uploaded"}
                        </p>
                      </div>
                      <span className="text-[9px] bg-sage-500 text-white px-2 py-1 rounded font-bold">
                        {uploadedProofs.length > 0 ? "UPLOADED" : "PENDING"}
                      </span>
                    </div>

                    {isUploading ? (
                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-[10px] font-bold text-olive-500 dark:text-sage-300">
                          <span>Uploading Document...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-olive-100 dark:bg-[#282f23] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sage-500 transition-all duration-100"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 flex items-center justify-center space-x-2 py-2.5 px-4 bg-white dark:bg-[#1a1e17] border border-[#E8E8E1] dark:border-[#2f3529] hover:border-olive-300 dark:hover:border-sage-600 rounded-xl cursor-pointer text-earth-muted dark:text-[#9ea396] hover:text-olive-500 dark:hover:text-sage-300 transition-all text-xs font-semibold"
                      >
                        <UploadCloud className="w-4 h-4 text-sage-500" />
                        <span>Drag & drop or Click to upload certificate</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </div>

                </div>
              </div>

              {/* Red warning banner / Calendar sync */}
              <div className="pt-4">
                <div className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-[#2b1f14] border border-orange-100 dark:border-orange-950/60 rounded-2xl">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs text-orange-800 dark:text-orange-300 leading-relaxed font-medium">
                      Your next formal hearing with <strong>Hon. Judge Elena Rosales</strong> is scheduled for <strong>Nov 02, 10:00 AM</strong>.
                    </p>
                    <button
                      onClick={() => showToast("Hearing schedule synced with calendar notifications.")}
                      className="text-[10px] text-orange-900 dark:text-orange-300 font-extrabold underline hover:text-orange-950 dark:hover:text-orange-200 uppercase tracking-wider block cursor-pointer"
                    >
                      SYNC TO CALENDAR
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </main>
      )}

      {/* History Log Tab */}
      {activeTab === "history" && (
        <main className="flex-grow bg-white dark:bg-[#1b1f18] rounded-[32px] p-6 md:p-8 shadow-sm border border-[#E8E8E1] dark:border-[#2f3529] max-w-5xl mx-auto w-full animate-fade-in transition-colors duration-300">
          <div className="flex items-center space-x-3 pb-6 border-b border-olive-100 dark:border-[#2f3529]">
            <div className="p-3 bg-[#EBEBE3] dark:bg-[#252b21] rounded-2xl text-olive-500 dark:text-sage-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-olive-500 dark:text-[#d2dbca]">Sanctuary Log History</h2>
              <p className="text-sm text-earth-muted dark:text-[#9ea396]">Permanent verified records for court auditing review</p>
            </div>
          </div>

          {/* Geolocation Interactive Map Visualization */}
          <div id="gps-compliance-map" className="mt-6 bg-[#FAF9F5] dark:bg-[#161a14] rounded-3xl border border-olive-100 dark:border-[#2c3327] p-4 md:p-6 space-y-4">
            {/* Map Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-olive-100/40 dark:border-[#2c3327] pb-4">
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-olive-800 dark:text-[#d2dbca] font-bold flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-sage-500 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Interactive GPS Spatial Map</span>
                </h3>
                <p className="text-[11px] text-earth-muted dark:text-[#9ea396]">
                  Verifiable location compliance mapping & safe geofenced zones
                </p>
              </div>

              {/* Map Filters & Controls */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
                {/* Timeframe selector with responsive staggered reload trigger */}
                <div className="flex items-center bg-white dark:bg-[#1f241d] rounded-xl border border-olive-100 dark:border-[#2f3529] p-1 shadow-sm">
                  <button
                    onClick={() => {
                      if (mapTimeframe !== "7days") {
                        setMapTimeframe("7days");
                        setSelectedLogId(null);
                        showToast("7-day view loaded: Pins staggered entrance sequence.");
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                      mapTimeframe === "7days"
                        ? "bg-sage-500 text-white shadow-sm"
                        : "text-earth-muted dark:text-[#9ea396] hover:text-olive-500 dark:hover:text-sage-300"
                    }`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => {
                      if (mapTimeframe !== "30days") {
                        setMapTimeframe("30days");
                        setSelectedLogId(null);
                        showToast("30-day view loaded: Full monthly pins staggered in.");
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                      mapTimeframe === "30days"
                        ? "bg-sage-500 text-white shadow-sm"
                        : "text-earth-muted dark:text-[#9ea396] hover:text-olive-500 dark:hover:text-sage-300"
                    }`}
                  >
                    Last 30 Days
                  </button>
                </div>

                {/* Zone category filter */}
                <select
                  value={mapZoneFilter}
                  onChange={(e: any) => setMapZoneFilter(e.target.value)}
                  className="bg-white dark:bg-[#1f241d] border border-olive-100 dark:border-[#2f3529] rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-olive-900 dark:text-[#e0e5da] outline-none focus:border-olive-400 dark:focus:border-sage-500"
                >
                  <option value="all">🗺️ All Zones</option>
                  <option value="home">🏡 Home Zone</option>
                  <option value="treatment">🏥 Treatment Sites</option>
                  <option value="other">📍 Other Checkins</option>
                </select>

                {/* Map zoom controls */}
                <div className="flex items-center bg-white dark:bg-[#1f241d] rounded-xl border border-olive-100 dark:border-[#2f3529] p-1 shadow-sm">
                  <button
                    onClick={() => setMapScale(prev => Math.min(prev + 0.25, 2.0))}
                    title="Zoom In"
                    className="p-1.5 text-earth-muted dark:text-[#9ea396] hover:text-olive-500 dark:hover:text-sage-300 transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMapScale(prev => Math.max(prev - 0.25, 0.75))}
                    title="Zoom Out"
                    className="p-1.5 text-earth-muted dark:text-[#9ea396] hover:text-olive-500 dark:hover:text-sage-300 transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setMapScale(1); setSelectedLogId(null); }}
                    title="Reset View"
                    className="p-1.5 text-earth-muted dark:text-[#9ea396] hover:text-olive-500 dark:hover:text-sage-300 transition-colors cursor-pointer border-l border-olive-100 dark:border-[#2f3529]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic scaling & coordinates derivation */}
            {(() => {
              // Filter the logs using selected timeframe and zone options
              const processedPoints = checkInLogs
                .filter(log => {
                  if (mapTimeframe === "7days") {
                    return !log.timestamp.includes("12 days") && 
                           !log.timestamp.includes("18 days") && 
                           !log.timestamp.includes("24 days") && 
                           !log.timestamp.includes("28 days");
                  }
                  return true;
                })
                .filter(log => {
                  if (mapZoneFilter === "home") return log.locationName.includes("Residence") || log.locationName.includes("Home");
                  if (mapZoneFilter === "treatment") return log.locationName.includes("Treatment") || log.locationName.includes("Sanctuary");
                  if (mapZoneFilter === "other") return !log.locationName.includes("Residence") && !log.locationName.includes("Home") && !log.locationName.includes("Treatment") && !log.locationName.includes("Sanctuary");
                  return true;
                })
                .map(log => {
                  const { lat, lng } = parseCoordinates(log.coordinates);
                  return { ...log, lat, lng };
                });

              const lats = processedPoints.map(p => p.lat);
              const lngs = processedPoints.map(p => p.lng);

              // Use static reference boundary if no points match, otherwise dynamic bounding box
              const defaultMinLat = 47.5900;
              const defaultMaxLat = 47.6200;
              const defaultMinLng = -122.3500;
              const defaultMaxLng = -122.3200;

              const minLat = lats.length > 0 ? Math.min(...lats) - 0.003 : defaultMinLat;
              const maxLat = lats.length > 0 ? Math.max(...lats) + 0.003 : defaultMaxLat;
              const minLng = lngs.length > 0 ? Math.min(...lngs) - 0.005 : defaultMinLng;
              const maxLng = lngs.length > 0 ? Math.max(...lngs) + 0.005 : defaultMaxLng;

              const latDiff = maxLat - minLat;
              const lngDiff = maxLng - minLng;

              const getPercentCoords = (lat: number, lng: number) => {
                const rawX = lngDiff === 0 ? 50 : ((lng - minLng) / lngDiff) * 100;
                const rawY = latDiff === 0 ? 50 : ((maxLat - lat) / latDiff) * 100;
                // Add bounds padding
                const x = 8 + (rawX * 0.84);
                const y = 8 + (rawY * 0.84);
                return { x, y };
              };

              const selectedPoint = processedPoints.find(p => p.id === selectedLogId);

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Interactive Canvas - Col Span 8 */}
                  <div className="lg:col-span-8 relative min-h-[380px] bg-[#EBEBE3]/40 dark:bg-[#0f120e] border border-olive-100 dark:border-[#272e22] rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between">
                    
                    {/* Water & Topo Mock SVG Vector Graphics Layer */}
                    <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                      {/* Waterbody Seattle (Puget Sound on left / Union Lake / Washington Lake) */}
                      <svg className="w-full h-full opacity-[0.25] dark:opacity-[0.2]" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Left water panel */}
                        <path d="M 0,0 Q 15,25 5,50 T 0,100 L 0,0 Z" fill="#6B8E23" className="fill-sage-400 dark:fill-sage-700 opacity-40 dark:opacity-30" />
                        {/* A central lake */}
                        <ellipse cx="85" cy="20" rx="10" ry="15" fill="#6B8E23" className="fill-sage-400 dark:fill-sage-700 opacity-30 dark:opacity-25" />
                        {/* Soft Topographic concentric loops */}
                        <path d="M 30,40 Q 50,20 70,45 T 90,80" fill="none" stroke="#4A5A31" className="stroke-[#4A5A31] dark:stroke-[#75885c]" strokeWidth="0.25" strokeDasharray="3,3" />
                        <path d="M 25,35 Q 48,15 68,40 T 88,75" fill="none" stroke="#4A5A31" className="stroke-[#4A5A31] dark:stroke-[#75885c]" strokeWidth="0.15" strokeDasharray="3,3" />
                        <path d="M 40,70 Q 60,60 80,85" fill="none" stroke="#4A5A31" className="stroke-[#4A5A31] dark:stroke-[#75885c]" strokeWidth="0.25" strokeDasharray="2,2" />
                      </svg>

                      {/* Stylised Coordinate Crosshair Lines */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1px] border-t border-dashed border-[#E8E8E1] dark:border-[#22281d] opacity-70"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-[1px] border-l border-dashed border-[#E8E8E1] dark:border-[#22281d] opacity-70"></div>
                      </div>

                      {/* Subtitle location markers as background decor */}
                      <div className="absolute bottom-4 left-6 text-[9px] text-[#808069] dark:text-[#717b68] font-mono tracking-wider font-semibold uppercase opacity-60">
                        🌐 Seattle Compliance Sector NW-2
                      </div>
                      <div className="absolute top-4 right-6 text-[9px] text-[#808069] dark:text-[#717b68] font-mono tracking-wider font-semibold opacity-60 text-right">
                        Lat Range: {minLat.toFixed(4)}° to {maxLat.toFixed(4)}°
                      </div>
                    </div>

                    {/* Fluid Timeframe Transition Indicator Pill */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                      <div className="bg-white/85 dark:bg-[#1b1f17]/90 backdrop-blur-md px-3 py-1 rounded-full border border-olive-100 dark:border-[#30382a] shadow-sm flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-ping"></span>
                        <span className="text-[10px] font-mono font-bold text-olive-800 dark:text-[#cad2c3]">
                          {processedPoints.length} verified pins • {mapTimeframe === "7days" ? "7-Day Log" : "30-Day Log"}
                        </span>
                      </div>
                    </div>

                    {/* Compliance Radius Ring Overlay around Safe Zones with Staggered Entrance */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <AnimatePresence mode="popLayout">
                        {processedPoints.map((p, index) => {
                          if (p.locationName.includes("Residence") || p.locationName.includes("Home")) {
                            const { x, y } = getPercentCoords(p.lat, p.lng);
                            return (
                              <motion.div 
                                key={`ring-home-${mapTimeframe}-${mapZoneFilter}-${p.id}`}
                                initial={{ opacity: 0, scale: 0.3 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.15 } }}
                                transition={{
                                  type: "spring",
                                  stiffness: 280,
                                  damping: 24,
                                  delay: index * 0.065 + 0.05,
                                }}
                                className="absolute w-24 h-24 border-2 border-dashed border-emerald-500/45 dark:border-emerald-400/40 rounded-full flex items-center justify-center animate-pulse"
                                style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) scale(${mapScale})` }}
                              >
                                <span className="text-[8px] font-mono text-emerald-800 dark:text-emerald-300 font-bold bg-white/90 dark:bg-[#1a1e17]/90 px-1 py-0.5 rounded border border-emerald-100 dark:border-emerald-800 shadow-sm pointer-events-none translate-y-8">
                                  250m Safe Zone
                                </span>
                              </motion.div>
                            );
                          }
                          if (p.locationName.includes("Treatment") || p.locationName.includes("Sanctuary")) {
                            const { x, y } = getPercentCoords(p.lat, p.lng);
                            return (
                              <motion.div 
                                key={`ring-clinic-${mapTimeframe}-${mapZoneFilter}-${p.id}`}
                                initial={{ opacity: 0, scale: 0.3 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.15 } }}
                                transition={{
                                  type: "spring",
                                  stiffness: 280,
                                  damping: 24,
                                  delay: index * 0.065 + 0.05,
                                }}
                                className="absolute w-36 h-36 border-2 border-dashed border-sky-500/35 dark:border-sky-400/35 rounded-full flex items-center justify-center"
                                style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) scale(${mapScale})` }}
                              >
                                <span className="text-[8px] font-mono text-sky-800 dark:text-sky-300 font-bold bg-white/90 dark:bg-[#1a1e17]/90 px-1 py-0.5 rounded border border-sky-100 dark:border-sky-800 shadow-sm pointer-events-none translate-y-12">
                                  Clinical Zone
                                </span>
                              </motion.div>
                            );
                          }
                          return null;
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Active Interactive Pins Container with Staggered Entrance Animation */}
                    <div 
                      className="absolute inset-0 z-20 transition-transform duration-500 ease-out"
                      style={{ transform: `scale(${mapScale})`, transformOrigin: 'center center' }}
                    >
                      <AnimatePresence mode="popLayout">
                        {processedPoints.map((p, index) => {
                          const { x, y } = getPercentCoords(p.lat, p.lng);
                          const isSelected = p.id === selectedLogId;
                          const isHome = p.locationName.includes("Residence") || p.locationName.includes("Home");
                          const isTreatment = p.locationName.includes("Treatment") || p.locationName.includes("Sanctuary");

                          return (
                            <motion.div 
                              key={`pin-${mapTimeframe}-${mapZoneFilter}-${p.id}`}
                              initial={{ opacity: 0, scale: 0, y: -28, filter: "blur(2px)" }}
                              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                              exit={{ opacity: 0, scale: 0.25, y: 10, transition: { duration: 0.15 } }}
                              transition={{
                                type: "spring",
                                stiffness: 450,
                                damping: 22,
                                mass: 0.7,
                                delay: index * 0.075, // Staggered entrance animation per pin!
                              }}
                              whileHover={{ scale: 1.25, zIndex: 60 }}
                              whileTap={{ scale: 0.92 }}
                              className="absolute -translate-x-3 -translate-y-3 cursor-pointer group"
                              style={{ left: `${x}%`, top: `${y}%` }}
                              onClick={() => {
                                setSelectedLogId(p.id);
                                showToast(`Focused: ${p.locationName} (${p.timestamp})`);
                              }}
                            >
                              {/* Stagger drop ripple effect */}
                              <motion.span
                                initial={{ opacity: 0.75, scale: 0.4 }}
                                animate={{ opacity: 0, scale: 2.2 }}
                                transition={{
                                  delay: index * 0.075 + 0.08,
                                  duration: 0.7,
                                  ease: "easeOut"
                                }}
                                className="absolute inset-0 rounded-full border-2 border-sage-500/80 pointer-events-none"
                              />

                              {/* Ripple ring for selected or hovered pin */}
                              <div className={`absolute -inset-2.5 rounded-full transition-all duration-300 ${
                                isSelected 
                                  ? "bg-rose-400/35 dark:bg-rose-500/40 animate-ping" 
                                  : "bg-olive-400/0 group-hover:bg-olive-400/20 dark:group-hover:bg-olive-300/20"
                              }`} />

                              {/* Pin design */}
                              <div className={`w-6.5 h-6.5 rounded-full shadow-md flex items-center justify-center border-2 transition-all ${
                                isSelected 
                                  ? "bg-rose-500 border-white dark:border-stone-900 text-white scale-120 z-40" 
                                  : isHome
                                    ? "bg-emerald-600 dark:bg-emerald-500 border-white dark:border-stone-900 text-white z-20"
                                    : isTreatment
                                      ? "bg-sky-600 dark:bg-sky-500 border-white dark:border-stone-900 text-white z-20"
                                      : "bg-amber-600 dark:bg-amber-500 border-white dark:border-stone-900 text-white z-10"
                              }`}>
                                {isHome ? (
                                  <span className="text-[9px] font-bold">🏡</span>
                                ) : isTreatment ? (
                                  <span className="text-[9px] font-bold">🏥</span>
                                ) : (
                                  <MapPin className="w-3.5 h-3.5" />
                                )}
                              </div>

                              {/* Mini badge overlay for status */}
                              {isSelected && (
                                <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[7px] font-extrabold uppercase px-1 rounded shadow pointer-events-none whitespace-nowrap tracking-wide">
                                  ACTIVE
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* Floating Details HUD Card (On-map selected log viewer) */}
                    <div className="absolute bottom-4 right-4 left-4 md:left-auto md:w-80 bg-white/95 dark:bg-[#1c2018]/95 backdrop-blur-sm p-4 rounded-2xl border border-olive-100 dark:border-[#32392c] shadow-lg z-30 animate-fade-in transition-all">
                      {selectedPoint ? (
                        <div className="space-y-2.5 text-stone-800 dark:text-[#e4e8de]">
                          <div className="flex items-center justify-between">
                            <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              selectedPoint.locationName.includes("Residence") 
                                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300" 
                                : selectedPoint.locationName.includes("Treatment") 
                                  ? "bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300" 
                                  : "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                            }`}>
                              {selectedPoint.locationName.includes("Residence") ? "Safe Haven Zone" : "Clinical Program"}
                            </span>
                            <span className="text-[9px] text-earth-muted dark:text-[#9ea396] font-mono">{selectedPoint.timestamp}</span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-olive-950 dark:text-[#f0f3eb] truncate">{selectedPoint.locationName}</h4>
                            <p className="text-[10px] text-earth-muted dark:text-[#9ea396] font-mono flex items-center">
                              <span className="inline-block w-1.5 h-1.5 bg-rose-500 rounded-full mr-1.5 animate-pulse"></span>
                              Coords: {selectedPoint.coordinates}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-[#2f3529]">
                            <div className="flex items-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                              <Check className="w-3.5 h-3.5 mr-1" />
                              <span>{selectedPoint.status}</span>
                            </div>
                            <button
                              onClick={() => showToast(`Integrity check: Log #${selectedPoint.id} verified with blockchain SHA-256 secure hash!`)}
                              className="text-[9px] font-bold uppercase tracking-wider text-olive-500 dark:text-sage-300 hover:text-rose-500 dark:hover:text-rose-400 hover:underline cursor-pointer"
                            >
                              VERIFY HASH
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 space-y-1">
                          <p className="text-xs font-bold text-earth-muted dark:text-[#9ea396]">No Ping Selected</p>
                          <p className="text-[10px] text-earth-light dark:text-[#7d8574]">Tap a pin on the map to inspect court compliance coordinates.</p>
                        </div>
                      )}
                    </div>

                    {/* Simple HUD Map Compass decoration */}
                    <div className="absolute top-4 left-4 p-2 bg-white/80 dark:bg-[#1c2018]/80 rounded-xl border border-olive-100 dark:border-[#32392c] shadow-sm z-30 pointer-events-none select-none flex items-center space-x-1.5">
                      <Compass className="w-4 h-4 text-olive-500 dark:text-sage-300" />
                      <span className="text-[9px] font-bold text-olive-800 dark:text-[#d2dbca] tracking-widest uppercase">N</span>
                    </div>
                  </div>

                  {/* Map Sidebar Stats - Col Span 4 */}
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-4 font-sans">
                    <div className="bg-white dark:bg-[#1b1f18] p-4 rounded-2xl border border-olive-100 dark:border-[#2f3529] shadow-sm space-y-4 flex-grow">
                      <h4 className="text-xs font-bold text-olive-800 dark:text-[#d2dbca] uppercase tracking-widest border-b border-olive-100 dark:border-[#2f3529] pb-2">
                        Compliance Analytics
                      </h4>

                      {/* Stat block 1 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-3 rounded-xl border border-olive-100/50 dark:border-[#2f3529]">
                          <span className="text-[9px] text-earth-muted dark:text-[#9ea396] font-bold block uppercase tracking-wide">Pings Plotted</span>
                          <span className="text-lg font-serif font-extrabold text-olive-800 dark:text-[#d2dbca] block">
                            {processedPoints.length} <span className="text-xs font-sans text-earth-muted dark:text-[#888e7f]">logs</span>
                          </span>
                        </div>
                        <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-3 rounded-xl border border-olive-100/50 dark:border-[#2f3529]">
                          <span className="text-[9px] text-earth-muted dark:text-[#9ea396] font-bold block uppercase tracking-wide">Clean Record</span>
                          <span className="text-lg font-serif font-extrabold text-emerald-700 dark:text-emerald-400 block flex items-center gap-0.5">
                            100% <span className="text-[8px] font-sans font-bold text-earth-muted dark:text-[#888e7f] uppercase">ok</span>
                          </span>
                        </div>
                      </div>

                      {/* Geographic spread representation */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-earth-muted dark:text-[#9ea396] font-bold block uppercase tracking-wide">Zone Verification Breakdown</span>
                        
                        <div className="space-y-1.5 text-[10px] font-medium text-stone-700 dark:text-[#c4cbbe]">
                          {/* Home Zone row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                              <span>Registered Home Zone</span>
                            </div>
                            <span className="font-mono font-bold">
                              {checkInLogs.filter(l => l.locationName.includes("Residence") || l.locationName.includes("Home")).length}
                            </span>
                          </div>

                          {/* Clinic row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                              <span>Sanctuary Clinical Zone</span>
                            </div>
                            <span className="font-mono font-bold">
                              {checkInLogs.filter(l => l.locationName.includes("Treatment") || l.locationName.includes("Sanctuary")).length}
                            </span>
                          </div>

                          {/* Other row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                              <span>Other Approved Districts</span>
                            </div>
                            <span className="font-mono font-bold">
                              {checkInLogs.filter(l => !l.locationName.includes("Residence") && !l.locationName.includes("Home") && !l.locationName.includes("Treatment") && !l.locationName.includes("Sanctuary")).length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compliance Status card */}
                      <div className="bg-sage-100/50 dark:bg-[#22291e] border border-sage-200 dark:border-[#323d2b] rounded-xl p-3 text-[11px] text-olive-900 dark:text-[#d3dacb] leading-relaxed space-y-1.5">
                        <p className="font-bold flex items-center text-olive-800 dark:text-sage-300">
                          <Shield className="w-3.5 h-3.5 mr-1 text-sage-600 dark:text-sage-400" />
                          Geofenced Compliance Check Passed
                        </p>
                        <p className="text-earth-muted dark:text-[#9ea396] text-[10px]">
                          No geofence breaches or unauthorized travels detected in the last 30 days. Court supervisor can download the encrypted KML map file.
                        </p>
                      </div>
                    </div>

                    {/* Export compliance map database */}
                    <button
                      onClick={() => {
                        showToast("Preparing coordinate dataset export...");
                        setTimeout(() => {
                          showToast("Success! GPS_Compliance_30Days_Report.kml exported. 📄🗺️");
                        }, 1200);
                      }}
                      className="w-full bg-olive-500 hover:bg-olive-600 dark:bg-sage-600 dark:hover:bg-sage-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex justify-center items-center space-x-2 transition-colors cursor-pointer active:scale-95 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export GPS Log (.KML)</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-6 border-t border-olive-100/40 dark:border-[#2f3529]">
            {/* GPS Location Checkins List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-olive-500 dark:text-[#d2dbca] font-semibold flex items-center">
                  <MapPinned className="w-5 h-5 mr-2 text-sage-500" />
                  GPS Verification Audits ({checkInLogs.length})
                </h3>
                <span className="text-[10px] text-earth-muted dark:text-[#9ea396] font-bold font-mono bg-olive-50 dark:bg-[#23281f] px-2 py-0.5 rounded border border-olive-100 dark:border-[#2f3529]">
                  Click log to pinpoint on map
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {checkInLogs.map((log) => {
                  const isSelected = log.id === selectedLogId;
                  return (
                    <div 
                      key={log.id} 
                      onClick={() => {
                        setSelectedLogId(log.id);
                        showToast(`Pinpointed: ${log.locationName}`);
                        // Scroll slightly to the map if screen is small
                        const mapEl = document.getElementById("gps-compliance-map");
                        if (mapEl && window.innerWidth < 768) {
                          mapEl.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                        isSelected 
                          ? "bg-rose-50/40 dark:bg-rose-950/30 border-rose-400 dark:border-rose-500/80 shadow-sm" 
                          : "bg-[#F9F9F7] dark:bg-[#20251c] border-olive-100 dark:border-[#2f3529] hover:border-olive-200 dark:hover:border-sage-600"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold transition-colors ${isSelected ? 'text-rose-700 dark:text-rose-400' : 'text-olive-500 dark:text-[#d2dbca]'}`}>
                          {log.locationName}
                        </p>
                        <p className="text-[11px] text-earth-muted dark:text-[#9ea396] font-mono">Coords: {log.coordinates}</p>
                        <p className="text-[10px] text-earth-light dark:text-[#7d8574] italic">{log.timestamp}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded border ${
                          isSelected 
                            ? "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-700" 
                            : "bg-sage-100 dark:bg-[#252d20] text-sage-700 dark:text-sage-300 border-sage-200 dark:border-[#384330]"
                        }`}>
                          {log.status}
                        </span>
                        {isSelected && <span className="text-[8px] text-rose-500 dark:text-rose-400 font-bold uppercase tracking-wider">Map Focus</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document and Certificates list */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-olive-500 dark:text-[#d2dbca] font-semibold flex items-center">
                <FileCheck className="w-5 h-5 mr-2 text-sage-500" />
                Submitted Treatment Proofs ({uploadedProofs.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {uploadedProofs.map((proof) => (
                  <div key={proof.id} className="bg-[#F9F9F7] dark:bg-[#20251c] p-4 rounded-2xl border border-olive-100 dark:border-[#2f3529] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-white dark:bg-[#1a1e17] rounded-xl border border-olive-100 dark:border-[#2f3529] text-sage-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-olive-500 dark:text-[#d2dbca] truncate max-w-xs">{proof.fileName}</p>
                        <p className="text-[10px] text-earth-light dark:text-[#7d8574]">{proof.uploadedAt} • {proof.fileSize}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(`Opening preview for ${proof.fileName}`)}
                      className="text-xs text-olive-500 dark:text-sage-300 font-bold hover:underline"
                    >
                      View
                    </button>
                  </div>
                ))}

                <div className="border border-dashed border-olive-200 dark:border-[#333b2c] rounded-2xl p-6 text-center bg-[#F9F9F7]/50 dark:bg-[#181c15]">
                  <UploadCloud className="w-8 h-8 text-earth-light dark:text-[#7d8574] mx-auto mb-2" />
                  <p className="text-xs text-earth-muted dark:text-[#9ea396]">Need to file another attendance certificate?</p>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="mt-2 text-xs font-bold text-olive-500 dark:text-sage-300 hover:underline cursor-pointer"
                  >
                    Go to Check-in Panel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <main className="flex-grow bg-white dark:bg-[#1b1f18] rounded-[32px] p-6 md:p-8 shadow-sm border border-[#E8E8E1] dark:border-[#2f3529] max-w-5xl mx-auto w-full animate-fade-in transition-colors duration-300">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-olive-100 dark:border-[#2f3529] mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#EBEBE3] dark:bg-[#252b20] rounded-2xl text-olive-500 dark:text-sage-300">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-olive-500 dark:text-[#d2dbca]">Secure Progress Reports</h2>
                <p className="text-sm text-earth-muted dark:text-[#9ea396]">Compile verified program logs and send securely to court officials</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Hand: Configuration Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#F9F9F7] dark:bg-[#20251c] p-6 rounded-3xl border border-olive-100 dark:border-[#2f3529] space-y-5">
                <h3 className="font-serif text-lg text-olive-500 dark:text-[#d2dbca] font-bold flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-sage-500" />
                  <span>Configure Report Package</span>
                </h3>

                <form onSubmit={handleCreateReport} className="space-y-4">
                  {/* Recipient Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-olive-700 dark:text-sage-300 block uppercase tracking-wider">Recipient Authority</label>
                    <select
                      value={selectedRecipientKey}
                      onChange={(e) => setSelectedRecipientKey(e.target.value)}
                      className="w-full bg-white dark:bg-[#161a14] border border-olive-100 dark:border-[#333b2c] rounded-xl px-4 py-3 text-sm text-olive-900 dark:text-[#e3e6de] focus:outline-none focus:border-olive-500 dark:focus:border-sage-400"
                    >
                      <option value="judge-rosales">Hon. Judge Elena Rosales (Superior Court)</option>
                      <option value="officer-ramirez">Probation Officer Ramirez (District 4)</option>
                      <option value="counselor-sterling">Dr. Claire Sterling, LMFT (Registered Counselor)</option>
                      <option value="custom">Custom Recipient (Manually specify)...</option>
                    </select>
                  </div>

                  {/* Custom Recipient Fields */}
                  {selectedRecipientKey === "custom" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-earth-light dark:text-[#9ea396] block uppercase">Full Name/Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Officer Miller"
                          value={customRecipientName}
                          onChange={(e) => setCustomRecipientName(e.target.value)}
                          className="w-full bg-white dark:bg-[#161a14] border border-olive-100 dark:border-[#333b2c] rounded-xl px-4 py-2.5 text-xs text-olive-900 dark:text-[#e3e6de] focus:outline-none focus:border-olive-500 dark:focus:border-sage-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-earth-light dark:text-[#9ea396] block uppercase">Secure Portal Email</label>
                        <input
                          type="email"
                          required
                          placeholder="officer.miller@court.gov"
                          value={customRecipientEmail}
                          onChange={(e) => setCustomRecipientEmail(e.target.value)}
                          className="w-full bg-white dark:bg-[#161a14] border border-olive-100 dark:border-[#333b2c] rounded-xl px-4 py-2.5 text-xs text-olive-900 dark:text-[#e3e6de] focus:outline-none focus:border-olive-500 dark:focus:border-sage-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Report Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-olive-700 dark:text-sage-300 block uppercase tracking-wider">Document Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Compliance & Treatment Progress Report"
                      value={newReportTitle}
                      onChange={(e) => setNewReportTitle(e.target.value)}
                      className="w-full bg-white dark:bg-[#161a14] border border-olive-100 dark:border-[#333b2c] rounded-xl px-4 py-3 text-sm text-olive-900 dark:text-[#e3e6de] focus:outline-none focus:border-olive-500 dark:focus:border-sage-400"
                    />
                  </div>

                  {/* Included Logs Checkboxes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-olive-700 dark:text-sage-300 block uppercase tracking-wider">Verified Records to Include</label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                        includeMeetingsLog 
                          ? "bg-sage-50 dark:bg-sage-950/40 border-sage-200 dark:border-sage-700 text-olive-900 dark:text-sage-200" 
                          : "bg-white dark:bg-[#161a14] border-olive-100 dark:border-[#2f3529] text-earth-muted dark:text-[#9ea396]"
                      }`}>
                        <input
                          type="checkbox"
                          checked={includeMeetingsLog}
                          onChange={(e) => setIncludeMeetingsLog(e.target.checked)}
                          className="rounded text-olive-500 focus:ring-olive-500 w-4 h-4"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold">Meetings Log</p>
                          <p className="text-[10px] text-earth-muted dark:text-[#889080]">{completedMeetingsCount} items</p>
                        </div>
                      </label>

                      <label className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                        includeGPSLog 
                          ? "bg-sage-50 dark:bg-sage-950/40 border-sage-200 dark:border-sage-700 text-olive-900 dark:text-sage-200" 
                          : "bg-white dark:bg-[#161a14] border-olive-100 dark:border-[#2f3529] text-earth-muted dark:text-[#9ea396]"
                      }`}>
                        <input
                          type="checkbox"
                          checked={includeGPSLog}
                          onChange={(e) => setIncludeGPSLog(e.target.checked)}
                          className="rounded text-olive-500 focus:ring-olive-500 w-4 h-4"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold">GPS Check-ins</p>
                          <p className="text-[10px] text-earth-muted dark:text-[#889080]">{checkInLogs.length} verified</p>
                        </div>
                      </label>

                      <label className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                        includeProofsLog 
                          ? "bg-sage-50 dark:bg-sage-950/40 border-sage-200 dark:border-sage-700 text-olive-900 dark:text-sage-200" 
                          : "bg-white dark:bg-[#161a14] border-olive-100 dark:border-[#2f3529] text-earth-muted dark:text-[#9ea396]"
                      }`}>
                        <input
                          type="checkbox"
                          checked={includeProofsLog}
                          onChange={(e) => setIncludeProofsLog(e.target.checked)}
                          className="rounded text-olive-500 focus:ring-olive-500 w-4 h-4"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold">Uploaded Proof</p>
                          <p className="text-[10px] text-earth-muted dark:text-[#889080]">{uploadedProofs.length} files</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Personal Reflections text area */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-olive-700 dark:text-sage-300 block uppercase tracking-wider">Defendant Statement / Counselor Note</label>
                    <textarea
                      rows={3}
                      value={personalNotes}
                      onChange={(e) => setPersonalNotes(e.target.value)}
                      className="w-full bg-white dark:bg-[#161a14] border border-olive-100 dark:border-[#333b2c] rounded-xl px-4 py-3 text-xs text-olive-900 dark:text-[#e3e6de] focus:outline-none focus:border-olive-500 dark:focus:border-sage-400 leading-relaxed resize-none"
                      placeholder="Add a personalized note or reflection on your compliance and recovery milestones."
                    />
                  </div>

                  {/* Secure Passcode */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-olive-700 dark:text-sage-300 block uppercase tracking-wider flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1 text-olive-500 dark:text-sage-400" /> Secure Portal Passcode <span className="text-[10px] text-earth-muted dark:text-[#889080] normal-case font-normal ml-1">(Optional)</span>
                      </label>
                    </div>
                    <input
                      type="password"
                      placeholder="Set access PIN (e.g. 1234)"
                      value={securePasscode}
                      onChange={(e) => setSecurePasscode(e.target.value)}
                      className="w-full bg-white dark:bg-[#161a14] border border-olive-100 dark:border-[#333b2c] rounded-xl px-4 py-3 text-xs text-olive-900 dark:text-[#e3e6de] focus:outline-none focus:border-olive-500 dark:focus:border-sage-400"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSendingReport}
                      className="w-full bg-olive-500 hover:bg-olive-600 dark:bg-sage-600 dark:hover:bg-sage-500 text-white py-3.5 rounded-2xl font-bold tracking-wide transition-all duration-200 flex justify-center items-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-wait cursor-pointer"
                    >
                      {isSendingReport ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>{sendingStep}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 text-sage-200" />
                          <span>SIGN & TRANSMIT SECURE REPORT</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Hand: Document Preview and History */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              {/* Dynamic Live Document Preview Sheet */}
              <div className="bg-[#FAF9F5] dark:bg-[#161913] border border-olive-100 dark:border-[#2f3529] rounded-3xl p-6 shadow-sm flex-grow relative overflow-hidden flex flex-col justify-between min-h-[380px]">
                {/* Court Seal background watermark */}
                <div className="absolute right-[-20px] top-[-20px] opacity-[0.04] dark:opacity-[0.07] text-[#4A5A31] dark:text-sage-400 pointer-events-none select-none">
                  <Shield className="w-64 h-64" />
                </div>

                <div className="space-y-4 z-10">
                  {/* Preview Document Header */}
                  <div className="border-b-2 border-olive-500/30 dark:border-sage-600/30 pb-3 text-center">
                    <span className="text-[9px] tracking-[0.2em] font-bold text-olive-500 dark:text-sage-400 block uppercase">
                      DAILY SANCTUARY COURT COMPLIANCE RECORD
                    </span>
                    <h4 className="font-serif text-sm font-bold text-olive-800 dark:text-[#d2dbca] mt-1 uppercase">
                      {newReportTitle || "Progress Draft"}
                    </h4>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] border-b border-olive-100 dark:border-[#2f3529] pb-3">
                    <div>
                      <span className="text-earth-light dark:text-[#889080] block">DEFENDANT</span>
                      <span className="font-bold text-olive-900 dark:text-[#e3e6de]">{userName}</span>
                    </div>
                    <div>
                      <span className="text-earth-light dark:text-[#889080] block">RECIPIENT</span>
                      <span className="font-bold text-olive-900 dark:text-[#e3e6de]">{getRecipientDetails().name}</span>
                    </div>
                    <div>
                      <span className="text-earth-light dark:text-[#889080] block">RECIPIENT PORTAL</span>
                      <span className="font-bold text-olive-900 dark:text-[#e3e6de] truncate block max-w-[150px]">{getRecipientDetails().email}</span>
                    </div>
                    <div>
                      <span className="text-earth-light dark:text-[#889080] block">STATUS</span>
                      <span className="font-extrabold text-sage-600 dark:text-sage-400 uppercase">DRAFT PREVIEW</span>
                    </div>
                  </div>

                  {/* Live Report Body content checkboxes summary */}
                  <div className="space-y-3 py-1 text-xs">
                    <div className="flex items-center justify-between border-b border-dotted border-olive-100 dark:border-[#2f3529] pb-1">
                      <span className="text-earth-muted dark:text-[#9ea396]">Compliance Streak:</span>
                      <span className="font-bold text-olive-900 dark:text-[#e3e6de]">{streakDays} Days (Compliant)</span>
                    </div>

                    {includeMeetingsLog && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-bold text-olive-800 dark:text-[#d2dbca]">
                          <span>Verified Meeting Logs:</span>
                          <span>{completedMeetingsCount} / {meetings.length} Verified</span>
                        </div>
                        <div className="bg-white/60 dark:bg-[#1e2319]/80 p-2 rounded-lg border border-olive-100 dark:border-[#2f3529] text-[10px] space-y-1 max-h-20 overflow-y-auto">
                          {meetings.map(m => (
                            <div key={m.id} className="flex justify-between items-center text-earth-muted dark:text-[#9ea396]">
                              <span className="truncate max-w-[150px]">• {m.name}</span>
                              <span className={m.status === "VERIFIED" ? "text-sage-600 dark:text-sage-400 font-bold" : "text-amber-600 dark:text-amber-400"}>
                                {m.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {includeGPSLog && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-bold text-olive-800 dark:text-[#d2dbca]">
                          <span>Secure GPS Check-in Logs:</span>
                          <span>{checkInLogs.length} Verified</span>
                        </div>
                        <div className="bg-white/60 dark:bg-[#1e2319]/80 p-2 rounded-lg border border-olive-100 dark:border-[#2f3529] text-[10px] space-y-1 max-h-20 overflow-y-auto">
                          {checkInLogs.map(l => (
                            <div key={l.id} className="flex justify-between text-earth-muted dark:text-[#9ea396]">
                              <span>• {l.locationName.split(" ")[0]} Area</span>
                              <span className="font-mono text-[9px]">{l.coordinates.split(" ")[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {includeProofsLog && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-bold text-olive-800 dark:text-[#d2dbca]">
                          <span>Treatment Proof Attachments:</span>
                          <span>{uploadedProofs.length} Certified</span>
                        </div>
                        <div className="bg-white/60 dark:bg-[#1e2319]/80 p-2 rounded-lg border border-olive-100 dark:border-[#2f3529] text-[10px] space-y-1 max-h-20 overflow-y-auto">
                          {uploadedProofs.map(p => (
                            <div key={p.id} className="flex justify-between text-earth-muted dark:text-[#9ea396]">
                              <span className="truncate max-w-[150px]">• {p.fileName}</span>
                              <span>{p.fileSize}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Personal statements */}
                    <div className="space-y-1">
                      <span className="font-bold text-olive-800 dark:text-[#d2dbca] block">Personal Compliance Notes:</span>
                      <p className="text-[10px] text-earth-muted dark:text-[#9ea396] bg-white/60 dark:bg-[#1e2319]/80 p-2 rounded-lg border border-olive-100 dark:border-[#2f3529] italic leading-relaxed line-clamp-2">
                        "{personalNotes || "No personal notes included."}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer seal signature stamp */}
                <div className="border-t border-olive-200 dark:border-[#2f3529] pt-3 flex justify-between items-end mt-4">
                  <div>
                    <span className="text-[8px] text-earth-light dark:text-[#889080] block uppercase">DIGITAL SECURITY SEAL</span>
                    <span className="font-mono text-[9px] text-olive-600 dark:text-sage-400 block">PREVIEW-SIGNATURE-DRAFT</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-[#A35252] dark:text-rose-400 border border-[#A35252]/30 dark:border-rose-400/30 px-2 py-0.5 rounded font-extrabold uppercase">
                      SECURE COMPLIANCE PORTAL
                    </span>
                  </div>
                </div>
              </div>

              {/* Sent Reports List */}
              <div className="bg-[#EBEBE3]/60 dark:bg-[#20251c] border border-olive-100 dark:border-[#2f3529] rounded-3xl p-6 flex flex-col space-y-3">
                <h4 className="font-serif text-sm font-bold text-olive-500 dark:text-[#d2dbca]">
                  Archived Reports & Transmissions ({reports.length})
                </h4>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {reports.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-earth-muted dark:text-[#9ea396]">No reports sent yet. Use the form to compile and transmit.</p>
                    </div>
                  ) : (
                    reports.map(rep => (
                      <div key={rep.id} className="bg-white dark:bg-[#181c15] p-3.5 rounded-xl border border-olive-100 dark:border-[#2f3529] space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-olive-900 dark:text-[#e3e6de] truncate max-w-[180px]">{rep.title}</p>
                            <p className="text-[10px] text-earth-light dark:text-[#889080]">{rep.generatedAt} to {rep.recipientName}</p>
                          </div>
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded ${
                            rep.status === "VERIFIED BY COURT" 
                              ? "bg-sage-100 dark:bg-sage-950/60 text-sage-700 dark:text-sage-300 border border-sage-200 dark:border-sage-800" 
                              : "bg-olive-100 dark:bg-[#252b20] text-olive-700 dark:text-sage-300 border border-olive-200 dark:border-[#384330]"
                          }`}>
                            {rep.status}
                          </span>
                        </div>

                        {/* Hash and Download button row */}
                        <div className="flex items-center justify-between text-[10px] border-t border-dashed border-olive-100 dark:border-[#2f3529] pt-2">
                          <span className="font-mono text-earth-light dark:text-[#889080] text-[9px] truncate max-w-[125px]">{rep.securityHash}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPreviewReport(rep);
                              }}
                              className="text-xs text-olive-500 dark:text-sage-300 font-bold hover:underline cursor-pointer"
                            >
                              View Detail
                            </button>
                            <button
                              onClick={() => handleDownloadReport(rep)}
                              className="text-olive-500 dark:text-sage-400 hover:text-olive-700 dark:hover:text-sage-200 font-bold cursor-pointer"
                              title="Download Report"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReport(rep.id)}
                              className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer"
                              title="Delete Archive Record"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Charts / Analytics Tab */}
      {activeTab === "charts" && (
        (() => {
          const rawChartData = generate30DayData();
          const currentChartData = rawChartData.slice(-parseInt(chartTimeframe));
          
          // Calculate counts for the selected timeframe
          const totalScheduledMeetings = currentChartData.reduce((acc, curr) => acc + curr.meetingsScheduled, 0);
          const totalAttendedMeetings = currentChartData.reduce((acc, curr) => acc + curr.meetingsAttended, 0);
          const totalRequiredGps = currentChartData.reduce((acc, curr) => acc + curr.gpsRequired, 0);
          const totalLoggedGps = currentChartData.reduce((acc, curr) => acc + curr.gpsLogged, 0);
          
          // Overall compliance rate
          const overallComplianceRate = Math.round(
            ((totalAttendedMeetings + totalLoggedGps) / (totalScheduledMeetings + totalRequiredGps)) * 100
          );

          // Group by week for Week-over-week bar chart (using last 4 weeks)
          const getWeeklyData = () => {
            const weekly = [];
            const chunk = 7;
            for (let i = 0; i < 4; i++) {
              const startIndex = i * chunk;
              const weekSlice = rawChartData.slice(startIndex, startIndex + chunk);
              const mAttended = weekSlice.reduce((acc, curr) => acc + curr.meetingsAttended, 0);
              const gLogged = weekSlice.reduce((acc, curr) => acc + curr.gpsLogged, 0);
              weekly.push({
                name: `Week ${i + 1}`,
                Meetings: mAttended,
                "GPS Pings": gLogged,
              });
            }
            return weekly;
          };
          
          const weeklyChartData = getWeeklyData();
          const pieChartData = getZoneDistribution();
          
          // Hourly distribution: standard hourly points: 8 AM, 12 PM, 7 PM are high, others low
          const hourlyData = [
            { hour: "06:00", pings: 1 },
            { hour: "08:00", pings: 14 },
            { hour: "10:00", pings: 2 },
            { hour: "12:00", pings: 18 },
            { hour: "14:00", pings: 1 },
            { hour: "16:00", pings: 3 },
            { hour: "18:00", pings: 12 },
            { hour: "20:00", pings: 15 },
            { hour: "22:00", pings: 1 },
          ];

          return (
            <main className="flex-grow bg-white dark:bg-[#1b1f18] rounded-[32px] p-6 md:p-8 shadow-sm border border-[#E8E8E1] dark:border-[#2f3529] max-w-5xl mx-auto w-full animate-fade-in space-y-8 transition-colors duration-300">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center pb-6 border-b border-olive-100 dark:border-[#2f3529] space-y-4 md:space-y-0">
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-sage-100 dark:bg-[#252b21] text-olive-500 dark:text-sage-300 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-olive-500 dark:text-[#d2dbca]">Recovery Analytics & Compliance Trends</h2>
                      <p className="text-sm text-earth-muted dark:text-[#9ea396]">30-day dynamic court-admissible visual audit logs</p>
                    </div>
                  </div>
                </div>
                
                {/* Visual Filters */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-olive-700 dark:text-[#cad2c3] uppercase tracking-wider">Timeframe:</span>
                  <div className="bg-[#F0F0EB] dark:bg-[#20251c] p-1 rounded-xl flex space-x-1 border border-olive-100 dark:border-[#2f3529]">
                    {(["7", "14", "30"] as const).map((days) => (
                      <button
                        key={days}
                        onClick={() => setChartTimeframe(days)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          chartTimeframe === days
                            ? "bg-white dark:bg-[#1a1e17] text-olive-800 dark:text-[#d2dbca] shadow-sm"
                            : "text-earth-muted dark:text-[#9ea396] hover:text-olive-500 dark:hover:text-sage-300"
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key metrics cards (Bento box style - 4 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-5 rounded-2xl border border-olive-100 dark:border-[#2f3529] flex flex-col justify-between h-32 card-hover-effect">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-earth-light dark:text-[#888e7f] uppercase tracking-wider">COMPLIANCE RATE</span>
                    <span className="p-1 bg-sage-100 dark:bg-[#252f20] text-sage-700 dark:text-sage-300 rounded-md"><Check className="w-3.5 h-3.5" /></span>
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-bold text-olive-500 dark:text-[#d2dbca]">{overallComplianceRate}%</p>
                    <p className="text-[10px] text-earth-muted dark:text-[#9ea396] uppercase tracking-wider font-semibold mt-1">Excellent Status</p>
                  </div>
                </div>

                <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-5 rounded-2xl border border-olive-100 dark:border-[#2f3529] flex flex-col justify-between h-32 card-hover-effect">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-earth-light dark:text-[#888e7f] uppercase tracking-wider">VERIFIED MEETINGS</span>
                    <span className="p-1 bg-sage-100 dark:bg-[#252f20] text-sage-700 dark:text-sage-300 rounded-md"><Video className="w-3.5 h-3.5" /></span>
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-bold text-olive-500 dark:text-[#d2dbca]">{totalAttendedMeetings} / {totalScheduledMeetings}</p>
                    <p className="text-[10px] text-earth-muted dark:text-[#9ea396] uppercase tracking-wider font-semibold mt-1">Attendance Logged</p>
                  </div>
                </div>

                <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-5 rounded-2xl border border-olive-100 dark:border-[#2f3529] flex flex-col justify-between h-32 card-hover-effect">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-earth-light dark:text-[#888e7f] uppercase tracking-wider">GPS PINGS LOGGED</span>
                    <span className="p-1 bg-sage-100 dark:bg-[#252f20] text-sage-700 dark:text-sage-300 rounded-md"><MapPin className="w-3.5 h-3.5" /></span>
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-bold text-olive-500 dark:text-[#d2dbca]">{totalLoggedGps} / {totalRequiredGps}</p>
                    <p className="text-[10px] text-earth-muted dark:text-[#9ea396] uppercase tracking-wider font-semibold mt-1">Verified Geozones</p>
                  </div>
                </div>

                <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-5 rounded-2xl border border-olive-100 dark:border-[#2f3529] flex flex-col justify-between h-32 card-hover-effect">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-earth-light dark:text-[#888e7f] uppercase tracking-wider">RECOVERY STREAK</span>
                    <span className="p-1 bg-[#EBEBE3] dark:bg-[#282f23] text-olive-500 dark:text-sage-300 rounded-md"><Award className="w-3.5 h-3.5 text-sage-500" /></span>
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-bold text-olive-500 dark:text-[#d2dbca]">{streakDays} Days</p>
                    <p className="text-[10px] text-earth-muted dark:text-[#9ea396] uppercase tracking-wider font-semibold mt-1">Uninterrupted Streak</p>
                  </div>
                </div>
              </div>

              {/* Graphical Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Chart 1: Compliance Trends & Streak Growth (Area Chart) - Full width / Span 12 */}
                <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-6 rounded-3xl border border-olive-100 dark:border-[#2f3529] lg:col-span-12 space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-olive-500 dark:text-[#d2dbca] flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-sage-600 dark:text-sage-400" />
                      Compliance & Streak Expansion Timeline
                    </h3>
                    <p className="text-xs text-earth-muted dark:text-[#9ea396]">Consecutive daily streak count and compliance level over last {chartTimeframe} days</p>
                  </div>
                  
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="complianceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8A9A5B" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#8A9A5B" stopOpacity={0.0}/>
                          </linearGradient>
                          <linearGradient id="streakGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isDarkMode ? "#A3B18A" : "#5A5A40"} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={isDarkMode ? "#A3B18A" : "#5A5A40"} stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#2d3427" : "#E2E6D5"} opacity={0.6} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDarkMode ? "#989e90" : "#7A7A63" }} stroke={isDarkMode ? "#3c4535" : "#D1D1C4"} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10, fill: isDarkMode ? "#989e90" : "#7A7A63" }} stroke={isDarkMode ? "#828c78" : "#5A5A40"} domain={[0, 100]} label={{ value: 'Compliance %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fill: isDarkMode ? '#cad2c3' : '#5A5A40', fontWeight: 'bold' } }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: isDarkMode ? "#989e90" : "#7A7A63" }} stroke="#8A9A5B" label={{ value: 'Streak Day', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 10, fill: '#8A9A5B', fontWeight: 'bold' } }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: isDarkMode ? "#1f241c" : "#FAF9F5", borderColor: isDarkMode ? "#363f2e" : "#CDD4B8", borderRadius: "16px", fontSize: "11px", color: isDarkMode ? "#e4e8de" : "#3A3A26" }}
                          itemStyle={{ padding: "1px 0" }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                        <Area yAxisId="left" type="monotone" dataKey="compliance" stroke={isDarkMode ? "#cad2c3" : "#5A5A40"} strokeWidth={2} fillOpacity={1} fill="url(#streakGrad)" name="Compliance Level (%)" />
                        <Area yAxisId="right" type="monotone" dataKey="streak" stroke="#8A9A5B" strokeWidth={2.5} fillOpacity={1} fill="url(#complianceGrad)" name="Streak Day" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Weekly Verification Split (Bar Chart) */}
                <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-6 rounded-3xl border border-olive-100 dark:border-[#2f3529] lg:col-span-6 space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-olive-500 dark:text-[#d2dbca] flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-sage-600 dark:text-sage-400" />
                      Weekly Log Verification Volume
                    </h3>
                    <p className="text-xs text-earth-muted dark:text-[#9ea396]">Breakdown of attended recovery meetings and GPS geofence checks</p>
                  </div>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#2d3427" : "#E2E6D5"} opacity={0.6} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDarkMode ? "#989e90" : "#7A7A63" }} stroke={isDarkMode ? "#3c4535" : "#D1D1C4"} />
                        <YAxis tick={{ fontSize: 10, fill: isDarkMode ? "#989e90" : "#7A7A63" }} stroke={isDarkMode ? "#3c4535" : "#D1D1C4"} />
                        <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#1f241c" : "#FAF9F5", borderColor: isDarkMode ? "#363f2e" : "#CDD4B8", borderRadius: "16px", fontSize: "11px", color: isDarkMode ? "#e4e8de" : "#3A3A26" }} />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                        <Bar dataKey="Meetings" fill={isDarkMode ? "#7e8870" : "#5A5A40"} radius={[4, 4, 0, 0]} name="Verified Meetings" />
                        <Bar dataKey="GPS Pings" fill="#8A9A5B" radius={[4, 4, 0, 0]} name="GPS Geofence Pings" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 3: Location Zone Frequency (Donut Chart) */}
                <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-6 rounded-3xl border border-olive-100 dark:border-[#2f3529] lg:col-span-6 space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-olive-500 dark:text-[#d2dbca] flex items-center">
                      <Compass className="w-5 h-5 mr-2 text-sage-600 dark:text-sage-400" />
                      Audit Zone Distribution
                    </h3>
                    <p className="text-xs text-earth-muted dark:text-[#9ea396]">Verified GPS pings distributed across your registered geofences</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="h-48 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={["#8A9A5B", "#A3B18A", "#657053", "#4A523E"][index % 4]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#1f241c" : "#FAF9F5", borderColor: isDarkMode ? "#363f2e" : "#CDD4B8", borderRadius: "12px", fontSize: "10px", color: isDarkMode ? "#e4e8de" : "#3A3A26" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Absolute center count label */}
                      <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                        <span className="text-lg font-serif font-bold text-olive-800 dark:text-[#d2dbca]">
                          {pieChartData.reduce((acc, curr) => acc + curr.value, 0)}
                        </span>
                        <span className="text-[9px] text-earth-light dark:text-[#888e7f] uppercase font-bold tracking-widest">Pings</span>
                      </div>
                    </div>

                    {/* Custom list-style legend */}
                    <div className="space-y-2 text-xs">
                      {pieChartData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ["#8A9A5B", "#A3B18A", "#657053", "#4A523E"][index % 4] }}></span>
                            <span className="font-medium text-olive-900 dark:text-[#d8ddd0]">{entry.name}</span>
                          </div>
                          <span className="font-bold text-earth-muted dark:text-[#9ea396]">{entry.value} logs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chart 4: Hourly Log Activity Peak Times (Line Chart) */}
                <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-6 rounded-3xl border border-olive-100 dark:border-[#2f3529] lg:col-span-12 space-y-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-olive-500 dark:text-[#d2dbca] flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-sage-600 dark:text-sage-400" />
                      GPS Ping Verification Density By Hour
                    </h3>
                    <p className="text-xs text-earth-muted dark:text-[#9ea396]">Demonstrates structured logging routine during your court-monitored windows</p>
                  </div>
                  
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#2d3427" : "#E2E6D5"} opacity={0.6} />
                        <XAxis dataKey="hour" tick={{ fontSize: 10, fill: isDarkMode ? "#989e90" : "#7A7A63" }} stroke={isDarkMode ? "#3c4535" : "#D1D1C4"} />
                        <YAxis tick={{ fontSize: 10, fill: isDarkMode ? "#989e90" : "#7A7A63" }} stroke={isDarkMode ? "#3c4535" : "#D1D1C4"} />
                        <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#1f241c" : "#FAF9F5", borderColor: isDarkMode ? "#363f2e" : "#CDD4B8", borderRadius: "16px", fontSize: "11px", color: isDarkMode ? "#e4e8de" : "#3A3A26" }} />
                        <Line type="monotone" dataKey="pings" stroke={isDarkMode ? "#A3B18A" : "#5A5A40"} strokeWidth={3} dot={{ fill: "#8A9A5B", r: 4 }} activeDot={{ r: 6 }} name="Ping Count" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-sage-50 dark:bg-[#232a1f] rounded-xl p-3 border border-sage-200 dark:border-[#333d2c] text-center text-xs text-sage-800 dark:text-sage-300 leading-relaxed">
                    ℹ️ <strong>Structured Routine Verified:</strong> Your check-ins are concentrated around <strong>8:00 AM (Morning Audit)</strong>, <strong>12:00 PM (Noon Check)</strong>, and <strong>8:00 PM (Night Circle Audit)</strong>, which aligns perfectly with state mandates.
                  </div>
                </div>
              </div>

              {/* Court Audit Simulator Section */}
              <div className="bg-[#FAF9F5] dark:bg-[#20251c] rounded-[32px] p-6 md:p-8 border border-olive-100 dark:border-[#2f3529] space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl font-bold text-olive-800 dark:text-[#d2dbca] flex items-center">
                      <Shield className="w-6 h-6 mr-2 text-olive-500 dark:text-sage-300" />
                      Pre-Court Legal Compliance Verification Audit
                    </h3>
                    <p className="text-xs text-earth-muted dark:text-[#9ea396] max-w-2xl leading-relaxed">
                      Run a simulated compliance validation scan. Our engine parses the SHA-256 cryptographically signed logs, GPS geofences, and zoom call registers to pre-verify your adherence before submitting to Judge Rosales.
                    </p>
                  </div>
                  <button
                    disabled={isAuditing}
                    onClick={handleRunAudit}
                    className="bg-olive-500 hover:bg-olive-600 dark:bg-sage-600 dark:hover:bg-sage-700 text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center space-x-2 flex-shrink-0 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                  >
                    {isAuditing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Auditing Logs...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Run Verification Scan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Audit Progress Bar */}
                {isAuditing && (
                  <div className="space-y-2 bg-white dark:bg-[#1a1e17] p-4 rounded-2xl border border-olive-100 dark:border-[#2f3529]">
                    <div className="flex justify-between text-xs font-bold text-olive-800 dark:text-[#d2dbca]">
                      <span>{auditStep}</span>
                      <span>{auditProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-olive-100 dark:bg-[#282f23] rounded-full overflow-hidden">
                      <div className="h-full bg-sage-500 transition-all duration-300" style={{ width: `${auditProgress}%` }}></div>
                    </div>
                  </div>
                )}

                {/* Beautiful Signed Certificate */}
                {showAuditCertificate && (
                  <div className="bg-white dark:bg-[#181c15] border-2 border-sage-500 rounded-2xl p-6 shadow-md relative overflow-hidden space-y-6 animate-scale-up">
                    <div className="absolute right-[-30px] top-[-30px] opacity-[0.05] dark:opacity-[0.08] pointer-events-none select-none">
                      <Shield className="w-48 h-48 text-sage-600 dark:text-sage-300" />
                    </div>

                    {/* Certificate Header */}
                    <div className="border-b border-olive-100 dark:border-[#2f3529] pb-4 text-center space-y-1">
                      <span className="text-[10px] font-extrabold tracking-[0.2em] text-sage-600 dark:text-sage-400 uppercase block">STATE COURT ADVOCACY PRE-COMPLIANCE</span>
                      <h4 className="font-serif text-lg font-bold text-olive-800 dark:text-[#d2dbca]">CERTIFICATE OF RIGOROUS ADHERENCE</h4>
                      <p className="text-[10px] text-earth-light dark:text-[#7d8574]">Generated on {new Date().toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })} • Device ID: Sanctuary-Client-iOS</p>
                    </div>

                    {/* Certificate Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-3 rounded-xl border border-olive-100 dark:border-[#2f3529]">
                        <span className="text-earth-light dark:text-[#888e7f] block text-[9px] font-bold uppercase tracking-wider">DEFENDANT</span>
                        <span className="font-bold text-olive-800 dark:text-[#d2dbca]">{userName}</span>
                      </div>
                      <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-3 rounded-xl border border-olive-100 dark:border-[#2f3529]">
                        <span className="text-earth-light dark:text-[#888e7f] block text-[9px] font-bold uppercase tracking-wider">COMPLIANCE SCORE</span>
                        <span className="font-extrabold text-[#3D6E42] dark:text-emerald-400 text-sm">{overallComplianceRate}%</span>
                      </div>
                      <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-3 rounded-xl border border-olive-100 dark:border-[#2f3529]">
                        <span className="text-earth-light dark:text-[#888e7f] block text-[9px] font-bold uppercase tracking-wider">VERIFIED TIMELINE</span>
                        <span className="font-bold text-olive-800 dark:text-[#d2dbca]">Last {chartTimeframe} Days</span>
                      </div>
                      <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-3 rounded-xl border border-olive-100 dark:border-[#2f3529]">
                        <span className="text-earth-light dark:text-[#888e7f] block text-[9px] font-bold uppercase tracking-wider">AUDIT STATUS</span>
                        <span className="font-extrabold text-sage-600 dark:text-sage-400 uppercase">PASSING (EXCELLENT)</span>
                      </div>
                    </div>

                    {/* Audit Checklist */}
                    <div className="bg-[#FAF9F5] dark:bg-[#20251c] p-4 rounded-xl border border-olive-100 dark:border-[#2f3529] text-xs space-y-2 font-mono text-olive-900 dark:text-[#d3dacb] leading-relaxed">
                      <p className="font-bold text-olive-800 dark:text-[#d2dbca]">&gt;&gt; LOG SCAN REPORT:</p>
                      <p className="flex items-center text-sage-700 dark:text-sage-300">
                        <Check className="w-4 h-4 mr-1.5 text-sage-600 dark:text-sage-400 flex-shrink-0" />
                        <span>Attendance Rate: {totalAttendedMeetings} / {totalScheduledMeetings} Mandatory recovery circle meetings verified ({totalScheduledMeetings > 0 ? Math.round((totalAttendedMeetings/totalScheduledMeetings)*100) : 100}% attendance).</span>
                      </p>
                      <p className="flex items-center text-sage-700 dark:text-sage-300">
                        <Check className="w-4 h-4 mr-1.5 text-sage-600 dark:text-sage-400 flex-shrink-0" />
                        <span>GPS Logs Verified: {totalLoggedGps} location coordinates registered and geofence matched. No out-of-boundary exceptions logged.</span>
                      </p>
                      <p className="flex items-center text-sage-700 dark:text-sage-300">
                        <Check className="w-4 h-4 mr-1.5 text-sage-600 dark:text-sage-400 flex-shrink-0" />
                        <span>Cryptographic Seal intact: System integrity confirmed. SHA-256 state check match.</span>
                      </p>
                    </div>

                    {/* Sign-offs */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end text-[10px] gap-4 pt-2">
                      <div className="space-y-1">
                        <p className="font-bold text-olive-800 dark:text-[#d2dbca]">EMBEDDED DIGITAL SIGNATURES:</p>
                        <p className="font-mono text-earth-light dark:text-[#888e7f] text-[9px]">{generatedAuditHash}</p>
                        <p className="text-earth-muted dark:text-[#9ea396]">Verified compliance audit key: <span className="font-semibold text-olive-600 dark:text-sage-400">sanc-verified-sig-{streakDays}d</span></p>
                      </div>
                      
                      <button
                        onClick={() => showToast("Downloading printable pre-audit certificate PDF...")}
                        className="w-full sm:w-auto bg-sage-500 hover:bg-sage-600 dark:bg-sage-600 dark:hover:bg-sage-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider flex justify-center items-center space-x-2 shadow-sm transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>DOWNLOAD SEALED REPORT</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </main>
          );
        })()
      )}

      {/* Resources Tab */}
      {activeTab === "resources" && (
        <main className="flex-grow bg-white dark:bg-[#1b1f18] rounded-[32px] p-6 md:p-8 shadow-sm border border-[#E8E8E1] dark:border-[#2f3529] max-w-5xl mx-auto w-full animate-fade-in transition-colors duration-300">
          <div className="pb-6 border-b border-olive-100 dark:border-[#2f3529] mb-6">
            <h2 className="text-2xl font-serif font-bold text-olive-500 dark:text-[#d2dbca]">Sanctuary Support Library</h2>
            <p className="text-sm text-earth-muted dark:text-[#9ea396]">Calming audios, local contacts, and compliance guidance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Mindful Soundscapes card */}
            <div className="bg-[#F9F9F7] dark:bg-[#20251c] rounded-2xl p-6 border border-olive-100 dark:border-[#2f3529] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-sage-100 dark:bg-[#252b20] text-olive-500 dark:text-sage-300 rounded-xl w-fit">
                  <Volume2 className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                </div>
                <h3 className="font-serif text-lg font-bold text-olive-500 dark:text-[#d2dbca]">Forest Solitude Audio</h3>
                <p className="text-xs text-earth-muted dark:text-[#9ea396] leading-relaxed">
                  A high-fidelity 15-minute ambient loops of nature birds and wind for panic relief and instant centering.
                </p>
              </div>
              <button
                onClick={() => showToast("Playing Forest Solitude loop... Relax and breathe.")}
                className="mt-4 w-full bg-olive-500 hover:bg-olive-600 dark:bg-sage-600 dark:hover:bg-sage-500 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                LISTEN NOW
              </button>
            </div>

            {/* Treatment Support Contacts */}
            <div className="bg-[#F9F9F7] dark:bg-[#20251c] rounded-2xl p-6 border border-olive-100 dark:border-[#2f3529] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-sage-100 dark:bg-[#252b20] text-olive-500 dark:text-sage-300 rounded-xl w-fit">
                  <User className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                </div>
                <h3 className="font-serif text-lg font-bold text-olive-500 dark:text-[#d2dbca]">Registered Counselor</h3>
                <p className="text-xs text-earth-muted dark:text-[#9ea396] leading-relaxed">
                  <strong>Dr. Claire Sterling, LMFT</strong><br />
                  District 4 Recovery Center<br />
                  Office hours: Mon-Fri 9AM-4PM
                </p>
              </div>
              <button
                onClick={() => showToast("Opening counselor messenger... Secure connection.")}
                className="mt-4 w-full bg-[#EBEBE3] dark:bg-[#2c3327] text-olive-500 dark:text-sage-300 py-2.5 rounded-xl text-xs font-bold hover:bg-olive-200 dark:hover:bg-[#394233] cursor-pointer transition-colors"
              >
                MESSAGE COUNSELOR
              </button>
            </div>

            {/* Court Handbook and Rules */}
            <div className="bg-[#F9F9F7] dark:bg-[#20251c] rounded-2xl p-6 border border-olive-100 dark:border-[#2f3529] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-sage-100 dark:bg-[#252b20] text-olive-500 dark:text-sage-300 rounded-xl w-fit">
                  <FileText className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                </div>
                <h3 className="font-serif text-lg font-bold text-olive-500 dark:text-[#d2dbca]">Compliance Handbook</h3>
                <p className="text-xs text-earth-muted dark:text-[#9ea396] leading-relaxed">
                  Official checklist for treatment certificate submission, drug screen records, and geographic radius boundaries.
                </p>
              </div>
              <button
                onClick={() => showToast("Opening District 4 handbook document (PDF)...")}
                className="mt-4 w-full bg-[#EBEBE3] dark:bg-[#2c3327] text-olive-500 dark:text-sage-300 py-2.5 rounded-xl text-xs font-bold hover:bg-olive-200 dark:hover:bg-[#394233] cursor-pointer transition-colors"
              >
                DOWNLOAD HANDBOOK
              </button>
            </div>

          </div>

          <div className="mt-8 bg-sage-100/40 dark:bg-[#20251c] p-6 rounded-2xl border border-sage-200/50 dark:border-[#2f3529]">
            <h4 className="font-serif text-base text-olive-500 dark:text-sage-400 font-bold mb-1">Affirmation of the Day</h4>
            <p className="text-sm italic text-earth-dark dark:text-[#e3e6de]">
              &ldquo;My past is a teacher, not a life sentence. Every calm breath I take is a brick in the sanctuary of my recovery.&rdquo;
            </p>
          </div>
        </main>
      )}

      {/* Support / Grounding Tab */}
      {activeTab === "support" && (
        (() => {
          const isGoldenAppleEnabled = redeemedRewards.includes("golden_apple");
          const isMudBathThemeEnabled = redeemedRewards.includes("mud_bath_spa");
          const isPorktraitEnabled = redeemedRewards.includes("porktrait_frame");
          const isBaconSizzleEnabled = redeemedRewards.includes("bacon_sizzle");

          // Grounding step configuration
          const stepDetails = [
            {
              title: "🐷 Start H.A.M. Grounding Quest",
              desc: "Take a deep breath. We will guide you through your 5 senses to bring your awareness back to the present moment, earning Ham Coins for your focus.",
              button: "Start Grounding Quest 🐽",
            },
            {
              title: "👁️ 5 Things You Can See",
              desc: "Look around your room. Enter 5 distinct objects you notice right now:",
              placeholder: ["Something shiny", "Something wooden", "A source of light", "A piece of furniture", "Something small"],
              count: 5,
              key: "see" as const,
              button: "Next: Touch ✋",
            },
            {
              title: "✋ 4 Things You Can Feel",
              desc: "Focus on your body's physical sensations. Enter 4 things you can touch or feel:",
              placeholder: ["The texture of your seat", "The temperature of the air", "Your feet on the ground", "The fabric of your shirt"],
              count: 4,
              key: "touch" as const,
              button: "Next: Hear 👂",
            },
            {
              title: "👂 3 Things You Can Hear",
              desc: "Close your eyes for 5 seconds and listen closely. Enter 3 sounds you can identify:",
              placeholder: ["A distant hum or traffic", "Your own steady breathing", "A clock ticking or fan breeze"],
              count: 3,
              key: "hear" as const,
              button: "Next: Smell 👃",
            },
            {
              title: "👃 2 Things You Can Smell",
              desc: "Inhale deeply. Name 2 scents you can perceive in your environment:",
              placeholder: ["Soap, coffee, or rain", "Clean air or wood perfume"],
              count: 2,
              key: "smell" as const,
              button: "Next: Taste 👅",
            },
            {
              title: "👅 1 Thing You Can Taste",
              desc: "Focus on your mouth. Name 1 taste you can discern right now:",
              placeholder: ["Toothpaste, mint, water, or clean palate"],
              count: 1,
              key: "taste" as const,
              button: "Complete Grounding 🏆",
            },
          ];

          const handleGroundingNext = () => {
            if (groundingStep < 5) {
              setGroundingStep(groundingStep + 1);
            } else {
              // Complete quest!
              const reward = isGoldenAppleEnabled ? 30 : 15;
              setHamCoins((prev) => prev + reward);
              setGroundingStep(6);
              showToast(`Quest Completed! You earned +${reward} Ham Coins! 🪙🐷`);
            }
          };

          const handleResetGrounding = () => {
            setGroundingStep(0);
            setGroundingInputs({
              see: ["", "", "", "", ""],
              touch: ["", "", "", ""],
              hear: ["", "", ""],
              smell: ["", ""],
              taste: [""]
            });
          };

          // H.A.M. Store configuration
          const storeItems = [
            {
              id: "bacon_sizzle",
              title: "Bacon Sizzle Audio 🥓",
              cost: 20,
              desc: "Soothing soundscape mimicking the cozy, crackling sizzle of frying bacon in a quiet forest cabin.",
            },
            {
              id: "mud_bath_spa",
              title: "Mud Bath Spa Theme 泥",
              cost: 40,
              desc: "Unlocks a warm, therapeutic pastel pink & mud-clay background style for ultimate grounding focus.",
            },
            {
              id: "golden_apple",
              title: "Dr. Claire's Golden Apple 🍎",
              cost: 65,
              desc: "A permanent recovery multiplier that awards 2x Ham Coins on all grounding & breathing exercises.",
            },
            {
              id: "porktrait_frame",
              title: "Pork-trait Royal Frame 👑",
              cost: 100,
              desc: "Equips a royal crown 👑 emoji and a curly pink tail border to your username header across the app.",
            },
          ];

          const buyStoreItem = (id: string, cost: number, title: string) => {
            if (hamCoins < cost) {
              showToast(`Insufficient Ham Coins! You need ${cost - hamCoins} more coins. 🐽`);
              return;
            }
            setHamCoins((prev) => prev - cost);
            setRedeemedRewards((prev) => [...prev, id]);
            showToast(`Redeemed! Unlocked "${title}" successfully. 🐷✨`);
          };

          return (
            <main className={`flex-grow rounded-[32px] p-6 md:p-8 shadow-sm border transition-all duration-500 max-w-5xl mx-auto w-full animate-fade-in space-y-8 ${
              isMudBathThemeEnabled 
                ? "bg-rose-50/50 dark:bg-[#2a1b1e] border-rose-200/60 dark:border-rose-900/50 text-stone-900 dark:text-[#f2dadf]" 
                : "bg-white dark:bg-[#1b1f18] border-[#E8E8E1] dark:border-[#2f3529] text-stone-800 dark:text-[#e3e6de]"
            }`}>
              
              {/* Header section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-olive-100/60 dark:border-[#2f3529] gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className={`p-3 rounded-2xl ${
                    isMudBathThemeEnabled 
                      ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300' 
                      : 'bg-sage-100 dark:bg-[#252b20] text-sage-600 dark:text-sage-400'
                  }`}>
                    <PiggyBank className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-olive-500 dark:text-[#d2dbca] flex items-center gap-2">
                      H.A.M. Gamified Support Sanctuary
                    </h2>
                    <p className="text-sm text-earth-muted dark:text-[#9ea396]">
                      Healthy Actions & Mindfulness — Earn coins, redeem rewards, and ground your spirit
                    </p>
                  </div>
                </div>

                {/* Piggy Bank Wallet Status */}
                <div className={`flex items-center space-x-3 px-5 py-3 rounded-2xl border ${
                  isMudBathThemeEnabled 
                    ? 'bg-rose-100/60 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200' 
                    : 'bg-[#FAF9F5] dark:bg-[#20251c] border-olive-100 dark:border-[#2f3529] text-olive-800 dark:text-[#d2dbca]'
                } font-bold shadow-sm`}>
                  <Coins className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="text-xs font-sans">
                    <span className="text-earth-muted dark:text-[#889080] text-[10px] block uppercase tracking-wider font-semibold">Piggy Bank Vault</span>
                    <span className="text-lg font-serif">{hamCoins}</span> Ham Coins
                  </div>
                </div>
              </div>

              {/* Sizzling bacon banner if active */}
              {isBaconSizzleEnabled && isBaconAudioPlaying && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex items-center justify-between animate-pulse">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🥓</span>
                    <div className="text-xs">
                      <p className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">Bacon Sizzle Audio Active</p>
                      <p className="text-amber-800 dark:text-amber-300 italic font-mono text-[10px]">&gt;&gt; Frying crackling sound wave loops playing soft pink noise...</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsBaconAudioPlaying(false)}
                    className="text-xs font-bold text-amber-700 dark:text-amber-200 bg-white dark:bg-[#251e13] border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-1 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50"
                  >
                    Mute 🔊
                  </button>
                </div>
              )}

              {/* Core interactive grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Grounding Wizard */}
                <div className={`p-6 rounded-3xl border transition-colors duration-300 flex flex-col justify-between min-h-[380px] ${
                  isMudBathThemeEnabled 
                    ? 'bg-rose-100/30 dark:bg-[#24171a] border-rose-200/50 dark:border-rose-900/40' 
                    : 'bg-[#FAF9F7] dark:bg-[#20251c] border-olive-100 dark:border-[#2f3529]'
                }`}>
                  {groundingStep === 0 && (
                    <div className="space-y-4 flex-grow">
                      <div className="flex items-center space-x-2 text-rose-500 dark:text-rose-400">
                        <Trophy className="w-5 h-5" />
                        <span className="text-xs font-extrabold uppercase tracking-widest font-sans">Active Mindfulness Quest</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-olive-800 dark:text-[#d2dbca]">The 5-4-3-2-1 "Ham-let" Grounding</h3>
                      <p className="text-xs text-earth-muted dark:text-[#9ea396] leading-relaxed">
                        Grounding is a highly active, court-recommended way to halt rising cravings or panic instantly. Type what you notice step-by-step.
                      </p>
                      <div className="bg-white/60 dark:bg-[#181c15]/80 p-4 rounded-xl border border-olive-100/40 dark:border-[#2f3529] text-[11px] text-earth-muted dark:text-[#9ea396] leading-relaxed space-y-1">
                        <p>💡 <strong className="text-olive-700 dark:text-sage-300">Quest Multipliers:</strong></p>
                        <p>• Standard Completion: <strong>+15 Ham Coins</strong></p>
                        {isGoldenAppleEnabled && <p className="text-emerald-700 dark:text-emerald-400 font-bold">🍎 Claire's Golden Apple: Active (Earns +30 Coins!)</p>}
                      </div>
                    </div>
                  )}

                  {groundingStep >= 1 && groundingStep <= 5 && (
                    <div className="space-y-4 flex-grow">
                      <div>
                        <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest">SENSE LEVEL {groundingStep} OF 5</span>
                        <h3 className="font-serif text-lg font-bold text-olive-800 dark:text-[#d2dbca]">{stepDetails[groundingStep].title}</h3>
                        <p className="text-[11px] text-earth-muted dark:text-[#9ea396] mt-0.5">{stepDetails[groundingStep].desc}</p>
                      </div>

                      {/* Inputs list */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {Array.from({ length: stepDetails[groundingStep].count }).map((_, idx) => {
                          const key = stepDetails[groundingStep].key;
                          return (
                            <input
                              key={idx}
                              type="text"
                              value={groundingInputs[key][idx] || ""}
                              onChange={(e) => {
                                const newArr = [...groundingInputs[key]];
                                newArr[idx] = e.target.value;
                                setGroundingInputs((prev) => ({
                                  ...prev,
                                  [key]: newArr,
                                }));
                              }}
                              placeholder={stepDetails[groundingStep].placeholder?.[idx] || `Item #${idx + 1}`}
                              className="w-full bg-white dark:bg-[#161a14] border border-olive-200/50 dark:border-[#333b2c] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 dark:focus:ring-rose-900/40 transition-all font-medium text-olive-950 dark:text-[#e3e6de]"
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {groundingStep === 6 && (
                    <div className="space-y-4 flex-grow">
                      <div className="text-center py-2 space-y-2">
                        <span className="text-4xl block animate-bounce">🐷✨🌾</span>
                        <h3 className="font-serif text-xl font-bold text-emerald-800 dark:text-emerald-400">Mud Bath Tranquility Ingestion</h3>
                        <p className="text-xs text-earth-dark dark:text-[#d2dbca] max-w-sm mx-auto leading-relaxed">
                          Your awareness is fully grounded! You successfully verified your senses and logged your environment. Adhering strictly to mindfulness keeps your streak active.
                        </p>
                      </div>

                      <div className="bg-white/80 dark:bg-[#161a14]/90 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 font-mono text-[10px] text-emerald-900 dark:text-emerald-300 leading-relaxed max-h-36 overflow-y-auto">
                        <p className="font-bold text-emerald-800 dark:text-emerald-400">&gt;&gt; RECORDED OBSERVATIONS:</p>
                        <p>• Seen: {groundingInputs.see.filter(Boolean).join(", ") || "Nothing"}</p>
                        <p>• Touched: {groundingInputs.touch.filter(Boolean).join(", ") || "Nothing"}</p>
                        <p>• Heard: {groundingInputs.hear.filter(Boolean).join(", ") || "Nothing"}</p>
                        <p>• Smelled: {groundingInputs.smell.filter(Boolean).join(", ") || "Nothing"}</p>
                        <p>• Tasted: {groundingInputs.taste.filter(Boolean).join(", ") || "Nothing"}</p>
                      </div>
                    </div>
                  )}

                  {/* Grounding actions */}
                  <div className="pt-4 border-t border-olive-100/50 dark:border-[#2f3529] flex justify-between items-center mt-4 font-sans">
                    {groundingStep > 0 && groundingStep < 6 && (
                      <button
                        onClick={() => setGroundingStep((s) => s - 1)}
                        className="text-xs font-bold text-earth-muted dark:text-[#9ea396] hover:text-olive-500 dark:hover:text-sage-300 cursor-pointer uppercase tracking-wider"
                      >
                        Back
                      </button>
                    )}
                    
                    {groundingStep === 0 && (
                      <button
                        onClick={() => setGroundingStep(1)}
                        className="w-full bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-bold py-3 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95 text-center"
                      >
                        {stepDetails[0].button}
                      </button>
                    )}

                    {groundingStep > 0 && groundingStep < 6 && (
                      <button
                        onClick={handleGroundingNext}
                        className="bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm ml-auto cursor-pointer"
                      >
                        {stepDetails[groundingStep].button}
                      </button>
                    )}

                    {groundingStep === 6 && (
                      <button
                        onClick={handleResetGrounding}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer text-center"
                      >
                        Perform Grounding Again 🔄
                      </button>
                    )}
                  </div>
                </div>

                {/* Piglet Centering Breath */}
                <div className={`p-6 rounded-3xl border transition-colors duration-300 flex flex-col justify-between min-h-[380px] ${
                  isMudBathThemeEnabled 
                    ? 'bg-rose-100/30 dark:bg-[#24171a] border-rose-200/50 dark:border-rose-900/40' 
                    : 'bg-sage-100/40 dark:bg-[#20251c] border-sage-200/60 dark:border-[#2f3529]'
                }`}>
                  <div className="space-y-4 text-center flex flex-col items-center">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-olive-700 dark:text-sage-400 uppercase tracking-widest block">Nervous System Pacemaker</span>
                      <h3 className="font-serif text-lg font-bold text-olive-800 dark:text-[#d2dbca]">🐽 Piglet Huffer-Puffer Centering</h3>
                      <p className="text-[11px] text-earth-muted dark:text-[#9ea396] max-w-sm mx-auto leading-relaxed">
                        Breathe in sync with the expanding piglet. Perform 5 continuous breaths to stabilize your system and earn coins.
                      </p>
                    </div>

                    {/* Animated Piglet SVG */}
                    <div 
                      onClick={() => {
                        if (!isBreathingActive) {
                          setIsBreathingActive(true);
                          showToast("Focus on the piglet. Inhale... Hold... Exhale.");
                        } else {
                          setIsBreathingActive(false);
                          showToast("Breathing session cancelled.");
                        }
                      }}
                      className="relative w-44 h-44 flex items-center justify-center cursor-pointer select-none group mt-2"
                    >
                      {/* Ripple background scaling up/down */}
                      <div className={`absolute inset-0 bg-rose-300/20 dark:bg-rose-500/10 rounded-full transition-all duration-1000 ease-in-out ${
                        isBreathingActive && breathingSessionPhase === "Inhale" ? "scale-115 opacity-90" :
                        isBreathingActive && breathingSessionPhase === "Hold" ? "scale-120 opacity-100" : "scale-90 opacity-40"
                      } ${isBreathingActive ? 'animate-none' : 'animate-pulse'}`}></div>

                      {/* Main Piglet Face Card */}
                      <div className={`w-32 h-32 rounded-full bg-rose-100 dark:bg-[#3d252a] border-4 transition-all duration-1000 ease-in-out flex flex-col items-center justify-center shadow-md relative overflow-hidden z-10 ${
                        isBreathingActive && breathingSessionPhase === "Inhale" ? "scale-110 border-rose-400 bg-rose-200/80 dark:bg-[#4d2f35]" :
                        isBreathingActive && breathingSessionPhase === "Hold" ? "scale-115 border-rose-500 bg-rose-200 dark:bg-[#52333a]" :
                        "scale-95 border-rose-300 dark:border-rose-900 bg-rose-100 dark:bg-[#3d252a]"
                      }`}>
                        {/* Pointy ears */}
                        <div className="absolute top-0 left-6 w-6 h-6 bg-rose-300 dark:bg-rose-700 rounded-tr-3xl rotate-[-25deg] border-t-2 border-l-2 border-rose-400 dark:border-rose-600"></div>
                        <div className="absolute top-0 right-6 w-6 h-6 bg-rose-300 dark:bg-rose-700 rounded-tl-3xl rotate-[25deg] border-t-2 border-r-2 border-rose-400 dark:border-rose-600"></div>

                        {/* Blushing Cheeks */}
                        <div className="absolute bottom-10 left-5 w-4 h-2 bg-rose-300/60 dark:bg-rose-600/40 rounded-full"></div>
                        <div className="absolute bottom-10 right-5 w-4 h-2 bg-rose-300/60 dark:bg-rose-600/40 rounded-full"></div>

                        {/* Pig eyes */}
                        <div className="flex space-x-10 mb-1.5 relative z-10">
                          <span className="w-2.5 h-2.5 bg-stone-800 dark:bg-stone-200 rounded-full flex items-center justify-center">
                            <span className="w-0.5 h-0.5 bg-white dark:bg-stone-900 rounded-full translate-x-[-0.5px] translate-y-[-0.5px]"></span>
                          </span>
                          <span className="w-2.5 h-2.5 bg-stone-800 dark:bg-stone-200 rounded-full flex items-center justify-center">
                            <span className="w-0.5 h-0.5 bg-white dark:bg-stone-900 rounded-full translate-x-[-0.5px] translate-y-[-0.5px]"></span>
                          </span>
                        </div>

                        {/* Cute Pig Snout */}
                        <div className="w-12 h-8 bg-rose-300 dark:bg-rose-700/80 rounded-2xl border-2 border-rose-400 dark:border-rose-600 flex items-center justify-center space-x-2 relative z-10 animate-pulse">
                          <span className="w-2.5 h-4 bg-rose-500/80 dark:bg-rose-400 rounded-full"></span>
                          <span className="w-2.5 h-4 bg-rose-500/80 dark:bg-rose-400 rounded-full"></span>
                        </div>

                        {/* Text Overlay */}
                        <div className="absolute bottom-2 text-[10px] font-extrabold uppercase tracking-widest text-rose-700 dark:text-rose-300 font-sans">
                          {isBreathingActive ? breathingSessionPhase : "BREATHE"}
                        </div>
                      </div>
                    </div>

                    {isBreathingActive ? (
                      <div className="space-y-1 font-sans">
                        <div className="flex items-center justify-center space-x-2 text-xs font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                          <Flame className="w-4 h-4" />
                          <span>Session Active • Cycle {breathCount + 1} / 5</span>
                        </div>
                        <p className="text-[10px] text-earth-muted dark:text-[#9ea396] font-mono">
                          {breathingSessionPhase === "Inhale" && "👃 Huff-and-puff IN... fill those lungs"}
                          {breathingSessionPhase === "Hold" && "⏳ Hold and sit with your strength"}
                          {breathingSessionPhase === "Exhale" && "💨 Slow snort OUT... releasing cravings"}
                        </p>
                      </div>
                    ) : (
                      <div className="text-[11px] text-earth-muted dark:text-[#9ea396] font-medium bg-white/50 dark:bg-[#181c15]/60 px-4 py-2 rounded-xl border border-olive-100/40 dark:border-[#2f3529]">
                        🐖 <strong>Click the piglet snout</strong> to trigger the 5-breath session.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!isBreathingActive) {
                        setIsBreathingActive(true);
                        showToast("Focus on the piglet. Inhale... Hold... Exhale.");
                      } else {
                        setIsBreathingActive(false);
                      }
                    }}
                    className={`w-full py-3 px-6 rounded-2xl text-xs uppercase tracking-wider font-extrabold transition-all shadow-md text-center cursor-pointer font-sans ${
                      isBreathingActive 
                        ? 'bg-rose-200 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200 border border-rose-300 dark:border-rose-800 hover:bg-rose-300' 
                        : 'bg-olive-500 hover:bg-olive-600 dark:bg-sage-600 dark:hover:bg-sage-500 text-white'
                    }`}
                  >
                    {isBreathingActive ? "Stop Breathing Session ⏹️" : "Start Piglet Centering 🐷"}
                  </button>
                </div>

              </div>

              {/* H.A.M. Store and Achievements */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
                
                {/* Store Section - Column Span 7 */}
                <div className={`p-6 rounded-3xl border lg:col-span-7 space-y-4 ${
                  isMudBathThemeEnabled 
                    ? 'bg-rose-100/30 dark:bg-[#24171a] border-rose-200/50 dark:border-rose-900/40' 
                    : 'bg-[#FAF9F7] dark:bg-[#20251c] border-olive-100 dark:border-[#2f3529]'
                }`}>
                  <div className="flex justify-between items-center pb-2 border-b border-olive-100/50 dark:border-[#2f3529]">
                    <h3 className="font-serif text-lg font-bold text-olive-800 dark:text-[#d2dbca] flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-500 animate-bounce" />
                      The H.A.M. Sanctuary Store
                    </h3>
                    <span className="text-[10px] font-bold text-earth-muted dark:text-[#889080] uppercase">Spend your Hard-Earned Coins</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {storeItems.map((item) => {
                      const isOwned = redeemedRewards.includes(item.id);
                      return (
                        <div 
                          key={item.id} 
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            isOwned 
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-stone-800 dark:text-stone-200 shadow-sm' 
                              : 'bg-white dark:bg-[#181c15] border-olive-100/60 dark:border-[#2f3529] hover:shadow-md'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-olive-900 dark:text-[#e3e6de] font-sans">{item.title}</h4>
                              {!isOwned && (
                                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md font-mono text-[9px] font-extrabold flex items-center gap-0.5">
                                  🪙 {item.cost}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-earth-muted dark:text-[#9ea396] leading-relaxed font-medium">{item.desc}</p>
                          </div>

                          {/* Purchase or toggle state button */}
                          <div className="pt-3">
                            {isOwned ? (
                              item.id === "bacon_sizzle" ? (
                                <button
                                  onClick={() => {
                                    setIsBaconAudioPlaying(!isBaconAudioPlaying);
                                    showToast(isBaconAudioPlaying ? "Muted bacon loop." : "Playing crackling bacon sizzles! Relax. 🥓");
                                  }}
                                  className={`w-full py-2 px-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer ${
                                    isBaconAudioPlaying 
                                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' 
                                      : 'bg-stone-100 dark:bg-[#252b20] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-[#384330] hover:bg-stone-200'
                                  }`}
                                >
                                  {isBaconAudioPlaying ? "MUTE SOUNDSCAPE 🔊" : "PLAY SOUNDSCAPE 🔇"}
                                </button>
                              ) : item.id === "mud_bath_spa" ? (
                                <button
                                  onClick={() => {
                                    if (redeemedRewards.includes("mud_bath_spa")) {
                                      setRedeemedRewards(prev => prev.filter(r => r !== "mud_bath_spa"));
                                      showToast("Switched back to standard calming theme.");
                                    } else {
                                      setRedeemedRewards(prev => [...prev, "mud_bath_spa"]);
                                      showToast("Activated warm mud-bath spa layout!");
                                    }
                                  }}
                                  className="w-full py-2 px-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wider bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 hover:bg-rose-300 cursor-pointer"
                                >
                                  {redeemedRewards.includes("mud_bath_spa") ? "Active Theme (Disable)" : "Theme Unlocked (Enable)"}
                                </button>
                              ) : item.id === "porktrait_frame" ? (
                                <button
                                  onClick={() => {
                                    if (redeemedRewards.includes("porktrait_frame")) {
                                      setRedeemedRewards(prev => prev.filter(r => r !== "porktrait_frame"));
                                      showToast("Profile frame disabled.");
                                    } else {
                                      setRedeemedRewards(prev => [...prev, "porktrait_frame"]);
                                      showToast("Profile frame equipped! 👑");
                                    }
                                  }}
                                  className="w-full py-2 px-3 rounded-xl text-[10px] font-extrabold uppercase tracking-wider bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 hover:bg-rose-300 cursor-pointer"
                                >
                                  {redeemedRewards.includes("porktrait_frame") ? "Equipped Frame 👑" : "Frame Unlocked (Equip)"}
                                </button>
                              ) : (
                                <span className="block text-center py-2 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                  ✔️ Permanent Pass Owned
                                </span>
                              )
                            ) : (
                              <button
                                onClick={() => buyStoreItem(item.id, item.cost, item.title)}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-3 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer"
                              >
                                Buy for {item.cost} Coins 🪙
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Achievements Section - Column Span 5 */}
                <div className={`p-6 rounded-3xl border lg:col-span-5 space-y-4 ${
                  isMudBathThemeEnabled 
                    ? 'bg-rose-100/30 dark:bg-[#24171a] border-rose-200/50 dark:border-rose-900/40' 
                    : 'bg-[#FAF9F7] dark:bg-[#20251c] border-olive-100 dark:border-[#2f3529]'
                }`}>
                  <div className="flex justify-between items-center pb-2 border-b border-olive-100/50 dark:border-[#2f3529]">
                    <h3 className="font-serif text-lg font-bold text-olive-800 dark:text-[#d2dbca] flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500 animate-pulse" />
                      Porcine Badges & Badges
                    </h3>
                    <span className="text-[10px] font-bold text-earth-muted dark:text-[#889080] uppercase">Unlocks</span>
                  </div>

                  <div className="space-y-3">
                    
                    {/* Badge 1 */}
                    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-[#181c15] rounded-2xl border border-olive-100/40 dark:border-[#2f3529]">
                      <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-lg shadow-inner">
                        🐖
                      </div>
                      <div className="text-xs">
                        <h4 className="font-bold text-olive-900 dark:text-[#e3e6de]">Apprentice Piglet</h4>
                        <p className="text-[10px] text-earth-muted dark:text-[#9ea396] font-medium">Earned first Ham Coin. (Always unlocked!)</p>
                      </div>
                      <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">✔️ Unlock</span>
                    </div>

                    {/* Badge 2 */}
                    {(() => {
                      const hasCompletedGrounding = groundingStep === 6;
                      return (
                        <div className={`flex items-center space-x-3 p-3 bg-white dark:bg-[#181c15] rounded-2xl border ${hasCompletedGrounding ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/10' : 'border-olive-100/40 dark:border-[#2f3529] opacity-70'}`}>
                          <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg shadow-inner ${hasCompletedGrounding ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' : 'bg-stone-100 dark:bg-[#252b20] border-stone-200 dark:border-[#384330]'}`}>
                            🧩
                          </div>
                          <div className="text-xs">
                            <h4 className="font-bold text-olive-900 dark:text-[#e3e6de]">Ham-let of Calm</h4>
                            <p className="text-[10px] text-earth-muted dark:text-[#9ea396] font-medium">Completed interactive 5-4-3-2-1 quest.</p>
                          </div>
                          <span className={`ml-auto font-bold text-xs uppercase tracking-wider ${hasCompletedGrounding ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`}>
                            {hasCompletedGrounding ? "✔️ Unlock" : "Locked"}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Badge 3 */}
                    {(() => {
                      const hasCompletedBreathing = redeemedRewards.includes("golden_apple") || hamCoins > 15;
                      return (
                        <div className={`flex items-center space-x-3 p-3 bg-white dark:bg-[#181c15] rounded-2xl border ${hasCompletedBreathing ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/10' : 'border-olive-100/40 dark:border-[#2f3529] opacity-70'}`}>
                          <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg shadow-inner ${hasCompletedBreathing ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' : 'bg-stone-100 dark:bg-[#252b20] border-stone-200 dark:border-[#384330]'}`}>
                            🌬️
                          </div>
                          <div className="text-xs">
                            <h4 className="font-bold text-olive-900 dark:text-[#e3e6de]">Huffer-Puffer Swine</h4>
                            <p className="text-[10px] text-earth-muted dark:text-[#9ea396] font-medium">Completed piglet centering session.</p>
                          </div>
                          <span className={`ml-auto font-bold text-xs uppercase tracking-wider ${hasCompletedBreathing ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`}>
                            {hasCompletedBreathing ? "✔️ Unlock" : "Locked"}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Badge 4 */}
                    {(() => {
                      const hasCompletedAudit = showAuditCertificate;
                      return (
                        <div className={`flex items-center space-x-3 p-3 bg-white dark:bg-[#181c15] rounded-2xl border ${hasCompletedAudit ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/10' : 'border-olive-100/40 dark:border-[#2f3529] opacity-70'}`}>
                          <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg shadow-inner ${hasCompletedAudit ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' : 'bg-stone-100 dark:bg-[#252b20] border-stone-200 dark:border-[#384330]'}`}>
                            🏛️
                          </div>
                          <div className="text-xs">
                            <h4 className="font-bold text-olive-900 dark:text-[#e3e6de]">Certified Royal Swine</h4>
                            <p className="text-[10px] text-earth-muted dark:text-[#9ea396] font-medium">Pre-Court compliance verification issued.</p>
                          </div>
                          <span className={`ml-auto font-bold text-xs uppercase tracking-wider ${hasCompletedAudit ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`}>
                            {hasCompletedAudit ? "✔️ Unlock" : "Locked"}
                          </span>
                        </div>
                      );
                    })()}

                  </div>
                </div>

              </div>

            </main>
          );
        })()
      )}

      {/* Footer Navigation Bar */}
      <footer className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-[#D1D1C4] dark:border-[#2f3529] space-y-4 md:space-y-0 text-sm">
        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`font-bold tracking-wider text-xs uppercase pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "text-olive-500 dark:text-sage-400 border-olive-500 dark:border-sage-400"
                : "text-earth-light dark:text-[#889080] border-transparent hover:text-olive-500 dark:hover:text-sage-300"
            }`}
          >
            DASHBOARD
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`font-bold tracking-wider text-xs uppercase pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "history"
                ? "text-olive-500 dark:text-sage-400 border-olive-500 dark:border-sage-400"
                : "text-earth-light dark:text-[#889080] border-transparent hover:text-olive-500 dark:hover:text-sage-300"
            }`}
          >
            HISTORY
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`font-bold tracking-wider text-xs uppercase pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "charts"
                ? "text-olive-500 dark:text-sage-400 border-olive-500 dark:border-sage-400"
                : "text-earth-light dark:text-[#889080] border-transparent hover:text-olive-500 dark:hover:text-sage-300"
            }`}
          >
            CHARTS
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`font-bold tracking-wider text-xs uppercase pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "reports"
                ? "text-olive-500 dark:text-sage-400 border-olive-500 dark:border-sage-400"
                : "text-earth-light dark:text-[#889080] border-transparent hover:text-olive-500 dark:hover:text-sage-300"
            }`}
          >
            REPORTS
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`font-bold tracking-wider text-xs uppercase pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "resources"
                ? "text-olive-500 dark:text-sage-400 border-olive-500 dark:border-sage-400"
                : "text-earth-light dark:text-[#889080] border-transparent hover:text-olive-500 dark:hover:text-sage-300"
            }`}
          >
            RESOURCES
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`font-bold tracking-wider text-xs uppercase pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "support"
                ? "text-olive-500 dark:text-sage-400 border-olive-500 dark:border-sage-400"
                : "text-earth-light dark:text-[#889080] border-transparent hover:text-olive-500 dark:hover:text-sage-300"
            }`}
          >
            🐷 H.A.M. SUPPORT
          </button>
        </div>

        {/* Emergency Assistance Call 988 */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-earth-light dark:text-[#889080] font-bold uppercase tracking-wider">
            Emergency Crisis Line:
          </span>
          <button
            onClick={() => setShowCrisisModal(true)}
            className="bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-xs font-bold border border-red-100 dark:border-red-900/60 transition-colors cursor-pointer tracking-wide active:scale-95 flex items-center space-x-1"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>CALL 988 NOW</span>
          </button>
        </div>
      </footer>

      {/* ZOOM MEETING SIMULATION MODAL */}
      {showZoomModal && (
        <div className="fixed inset-0 bg-stone-900/90 flex items-center justify-center z-50 p-4 md:p-6 backdrop-blur-sm">
          <div className="bg-stone-950 w-full max-w-5xl rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col h-[85vh] max-h-[750px]">
            
            {/* Zoom Title Bar */}
            <div className="bg-stone-900 px-6 py-4 border-b border-stone-800 flex justify-between items-center text-stone-200">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                <h3 className="font-serif font-bold text-base md:text-lg">Serene Recovery Circle (Live Room)</h3>
              </div>
              <div className="flex items-center space-x-4 text-xs font-semibold text-stone-400">
                <span className="bg-stone-800 px-3 py-1 rounded-full text-stone-300">
                  Time: {Math.floor(zoomTimer / 60)}:{(zoomTimer % 60).toString().padStart(2, '0')}
                </span>
                <span className="bg-sage-600 text-white px-2.5 py-1 rounded-full font-bold">
                  Attendance Logged
                </span>
              </div>
            </div>

            {/* Video + Chat Body */}
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
              
              {/* Video Grid (Left) */}
              <div className="flex-grow p-4 bg-stone-950 flex flex-col justify-between overflow-y-auto space-y-4">
                
                {/* 4 Video Box Placeholders */}
                <div className="grid grid-cols-2 gap-4 flex-grow">
                  
                  {/* Participant 1: Host */}
                  <div className="bg-[#5A5A40]/10 border border-olive-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden h-40">
                    <div className="absolute top-2 left-2 bg-stone-900/80 px-2 py-0.5 rounded text-[9px] font-bold text-stone-300 uppercase">
                      Host • Counselor Claire
                    </div>
                    <div className="w-14 h-14 bg-olive-500 rounded-full flex items-center justify-center font-serif text-white text-xl font-bold mb-2">
                      CC
                    </div>
                    <span className="text-xs text-stone-300 font-semibold">Claire Sterling (Sponsor)</span>
                    <span className="text-[10px] text-sage-400">● Speaking</span>
                  </div>

                  {/* Participant 2: User */}
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative h-40">
                    <div className="absolute top-2 left-2 bg-stone-900/80 px-2 py-0.5 rounded text-[9px] font-bold text-stone-300 uppercase">
                      You • Marcus
                    </div>
                    <div className="w-14 h-14 bg-[#8A9A5B] rounded-full flex items-center justify-center font-serif text-white text-xl font-bold mb-2">
                      {userName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-stone-300 font-semibold">{userName} (Compliance Day 142)</span>
                    <span className="text-[10px] text-stone-500">Muted</span>
                  </div>

                  {/* Participant 3: Dave */}
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative h-40">
                    <div className="absolute top-2 left-2 bg-stone-900/80 px-2 py-0.5 rounded text-[9px] font-bold text-stone-300 uppercase">
                      Dave S.
                    </div>
                    <div className="w-14 h-14 bg-[#cdcdbb] rounded-full flex items-center justify-center font-serif text-olive-500 text-xl font-bold mb-2">
                      DS
                    </div>
                    <span className="text-xs text-stone-300 font-semibold">Sponsor Dave</span>
                    <span className="text-[10px] text-stone-500">Muted</span>
                  </div>

                  {/* Participant 4: Sophia */}
                  <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative h-40">
                    <div className="absolute top-2 left-2 bg-stone-900/80 px-2 py-0.5 rounded text-[9px] font-bold text-stone-300 uppercase">
                      Sophia K.
                    </div>
                    <div className="w-14 h-14 bg-[#4A4A35] rounded-full flex items-center justify-center font-serif text-white text-xl font-bold mb-2">
                      SK
                    </div>
                    <span className="text-xs text-stone-300 font-semibold">Sophia K.</span>
                    <span className="text-[10px] text-stone-500">Muted</span>
                  </div>

                </div>

                {/* Simulated Breathing Circle Guide to help recovery in live meetings */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Zen Healing Module</span>
                    <h4 className="text-sm font-serif text-stone-200">Group Breathing Pacemaker</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      Follow the live pace to calm anxiety. Synchronized for all participants.
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center w-28 text-center space-y-1">
                    <div 
                      className="rounded-full bg-sage-500 flex items-center justify-center transition-all duration-500 ease-in-out"
                      style={{
                        width: breathingPhase === "Inhale" ? "4.5rem" : breathingPhase === "Hold" ? "5rem" : "3.5rem",
                        height: breathingPhase === "Inhale" ? "4.5rem" : breathingPhase === "Hold" ? "5rem" : "3.5rem",
                        opacity: breathingPhase === "Hold" ? 1 : 0.8,
                      }}
                    >
                      <span className="text-[10px] text-white font-extrabold uppercase tracking-wider">{breathingPhase}</span>
                    </div>
                    <span className="text-[9px] text-stone-400 font-semibold italic">Focus and Breathe</span>
                  </div>
                </div>

              </div>

              {/* Chat Sidebar (Right) */}
              <div className="w-full md:w-80 bg-stone-900 border-t md:border-t-0 md:border-l border-stone-800 flex flex-col justify-between h-48 md:h-auto">
                <div className="p-3 border-b border-stone-800 text-stone-300 text-xs font-bold uppercase tracking-wider">
                  Live Meeting Chat
                </div>

                {/* Chats box */}
                <div className="flex-grow p-4 overflow-y-auto space-y-3 text-xs">
                  {zoomChat.map((msg, idx) => (
                    <div key={idx} className="space-y-1 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/40">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-sage-400">{msg.sender}</span>
                        <span className="text-stone-500">{msg.time}</span>
                      </div>
                      <p className="text-stone-300 font-medium leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Form input */}
                <form onSubmit={handleSendChat} className="p-3 border-t border-stone-800 bg-stone-950 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type comforting words..."
                    value={newChatMsg}
                    onChange={(e) => setNewChatMsg(e.target.value)}
                    className="flex-grow bg-stone-900 text-stone-200 border border-stone-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-olive-500"
                  />
                  <button type="submit" className="bg-olive-500 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-olive-600">
                    Send
                  </button>
                </form>

              </div>

            </div>

            {/* Bottom Call Controls */}
            <div className="bg-stone-900 px-6 py-4 border-t border-stone-800 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button onClick={() => showToast("Microphone is locked by sponsor host.")} className="text-xs text-stone-400 bg-stone-800 px-3.5 py-2 rounded-xl hover:text-stone-200 hover:bg-stone-700 font-semibold">
                  Muted
                </button>
                <button onClick={() => showToast("Video is verified streaming (Secure Court stream).")} className="text-xs text-stone-400 bg-stone-800 px-3.5 py-2 rounded-xl hover:text-stone-200 hover:bg-stone-700 font-semibold">
                  Camera On
                </button>
              </div>

              <button
                onClick={handleLeaveCircle}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs tracking-wide"
              >
                LEAVE & TRANSMIT LOGS
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EMERGENCY HELP / CRISIS OVERLAY */}
      {showCrisisModal && (
        <div className="fixed inset-0 bg-[#4A4A35]/40 dark:bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1b1f18] max-w-lg w-full rounded-[32px] p-6 md:p-8 border border-olive-200 dark:border-[#2f3529] shadow-2xl relative animate-scale-up space-y-6">
            
            <button
              onClick={() => setShowCrisisModal(false)}
              className="absolute top-6 right-6 p-2 bg-olive-50 hover:bg-olive-100 dark:bg-[#252b20] dark:hover:bg-[#323a2a] text-olive-500 dark:text-sage-300 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pb-4 border-b border-olive-100 dark:border-[#2f3529]">
              <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-red-600 dark:text-red-400">Emergency Support Sanctuary</h3>
                <p className="text-xs text-earth-muted dark:text-[#9ea396]">You are not alone. Warm help is available 24/7</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-earth-dark dark:text-[#e3e6de] leading-relaxed font-medium">
                If you are experiencing severe stress, cravings, or anxiety, please take a slow breath. We have gathered quick, direct lines of contact for immediate comforting assistance:
              </p>

              <div className="space-y-3">
                
                {/* 988 Call Button */}
                <a
                  href="tel:988"
                  onClick={() => showToast("Connecting to 988 National Suicide & Crisis Lifeline...")}
                  className="flex items-center justify-between p-4 bg-red-50 hover:bg-red-100/80 dark:bg-red-950/40 dark:hover:bg-red-900/60 rounded-2xl border border-red-100/50 dark:border-red-900/50 transition-colors cursor-pointer text-red-700 dark:text-red-300"
                >
                  <div className="flex items-center space-x-3">
                    <PhoneCall className="w-5 h-5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">Call 988 Lifeline</h4>
                      <p className="text-[11px] opacity-85">Free, confidential, 24/7 voice support</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </a>

                {/* Crisis Text Line */}
                <a
                  href="sms:741741?&body=HOME"
                  onClick={() => showToast("Connecting to Crisis Text Line...")}
                  className="flex items-center justify-between p-4 bg-[#F9F9F7] dark:bg-[#20251c] hover:bg-olive-50 dark:hover:bg-[#272e22] rounded-2xl border border-olive-100 dark:border-[#2f3529] transition-colors cursor-pointer text-olive-600 dark:text-sage-300"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">Text HOME to 741741</h4>
                      <p className="text-[11px] opacity-85 text-earth-muted dark:text-[#9ea396]">Immediate crisis counselor via SMS chat</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </a>

                {/* Local Counselor Contact */}
                <div className="p-4 bg-sage-100/30 dark:bg-[#20251c] rounded-2xl border border-sage-200/50 dark:border-[#2f3529]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-olive-600 dark:text-sage-400">Your Assigned Treatment Center</h4>
                  <p className="text-xs text-earth-dark dark:text-[#d2dbca] mt-1">
                    <strong>District 4 Recovery Help Desk:</strong> <a href="tel:555-0199" className="underline font-bold text-olive-500 dark:text-sage-300">555-0199</a><br />
                    Available Mon-Sun 6AM - 10PM.
                  </p>
                </div>

              </div>

              {/* Soothing grounding exercise */}
              <div className="bg-olive-50 dark:bg-[#1a1e17] p-4 rounded-2xl border border-olive-100/50 dark:border-[#2f3529] text-center">
                <p className="text-xs italic text-olive-600 dark:text-sage-400">
                  &ldquo;This moment will pass. Place one hand on your heart, take a deep inhale for 4 seconds, hold for 4, and let it out slow.&rdquo;
                </p>
              </div>

            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setShowCrisisModal(false)}
                className="bg-[#EBEBE3] dark:bg-[#2c3327] hover:bg-olive-200 dark:hover:bg-[#394233] text-olive-500 dark:text-sage-300 font-bold py-3 px-6 rounded-xl text-xs tracking-wider cursor-pointer"
              >
                CLOSE SANCTUARY HELP
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Past Report Detail Modal */}
      {selectedPreviewReport && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/75 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#1b1f18] rounded-[32px] max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-olive-100 dark:border-[#2f3529] relative animate-scale-up max-h-[90vh] overflow-y-auto flex flex-col justify-between">
            <button
              onClick={() => setSelectedPreviewReport(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F0F0EB] dark:hover:bg-[#272e22] text-earth-light dark:text-[#889080] hover:text-olive-500 dark:hover:text-sage-300 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex items-center space-x-3 pb-4 border-b border-olive-100 dark:border-[#2f3529]">
                <div className="p-2.5 bg-sage-50 dark:bg-sage-950/60 text-sage-600 dark:text-sage-400 rounded-xl">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-olive-500 dark:text-[#d2dbca]">Transmitted Court Document</h3>
                  <p className="text-xs text-earth-muted dark:text-[#9ea396]">ID: {selectedPreviewReport.id} • Sent {selectedPreviewReport.generatedAt}</p>
                </div>
              </div>

              {/* Physical Paper Report */}
              <div className="bg-[#FAF9F5] dark:bg-[#161913] border border-olive-200/60 dark:border-[#2f3529] p-6 rounded-2xl shadow-inner text-xs space-y-4 font-mono leading-relaxed relative overflow-hidden text-olive-900 dark:text-[#e3e6de]">
                <div className="absolute right-2 top-2 opacity-10 dark:opacity-[0.05]">
                  <Shield className="w-40 h-40" />
                </div>

                <div className="border-b border-olive-200 dark:border-[#2f3529] pb-2 text-center">
                  <span className="text-[10px] font-bold tracking-widest block uppercase text-olive-500 dark:text-sage-400">STATE OF WASHINGTON</span>
                  <span className="text-[8px] block text-earth-light dark:text-[#889080] uppercase">TREATMENT COURT COMPLIANCE DIVISION</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] bg-white/40 dark:bg-[#20251c]/80 p-3 rounded border border-olive-100 dark:border-[#2f3529]">
                  <div>
                    <span className="text-earth-light dark:text-[#889080] block">DEFENDANT:</span>
                    <span className="font-bold">{userName}</span>
                  </div>
                  <div>
                    <span className="text-earth-light dark:text-[#889080] block">RECIPIENT:</span>
                    <span className="font-bold">{selectedPreviewReport.recipientName}</span>
                  </div>
                  <div>
                    <span className="text-earth-light dark:text-[#889080] block">SECURE PORTAL:</span>
                    <span className="font-bold text-xs">{selectedPreviewReport.recipientEmail}</span>
                  </div>
                  <div>
                    <span className="text-earth-light dark:text-[#889080] block">COURT STATUS:</span>
                    <span className="text-[#3D6E42] dark:text-sage-400 font-bold">VERIFIED & ARCHIVED</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-b border-dashed border-olive-200 dark:border-[#2f3529] py-3">
                  <p className="font-bold text-olive-800 dark:text-sage-300">&gt;&gt;&gt; METRIC AUDIT LOGS APPENDED:</p>
                  <p>• Consecutive Days Clean/Compliant: {selectedPreviewReport.streakAtTime} Days</p>
                  <p>• Attended & Verified Group Circles: {selectedPreviewReport.meetingsChecked} / {selectedPreviewReport.totalMeetingsCount} Sessions</p>
                  <p>• Device GPS Audit Coordinates Logged: {selectedPreviewReport.gpsPingsCount} locations verified</p>
                  <p>• Independent Treatment Certifications: {selectedPreviewReport.proofsCount} submitted file proofs</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-olive-800 dark:text-sage-300">&gt;&gt;&gt; COMPLIANCE REFLECTION STATEMENT:</p>
                  <p className="italic bg-white/50 dark:bg-[#20251c]/80 p-2.5 rounded border border-olive-100 dark:border-[#2f3529]">"{selectedPreviewReport.personalNotes}"</p>
                </div>

                <div className="border-t border-olive-200 dark:border-[#2f3529] pt-3 flex justify-between items-end text-[10px]">
                  <div>
                    <p className="font-bold text-olive-800 dark:text-sage-300">DIGITAL EMBEDDED SIGNATURES:</p>
                    <p className="text-[8px] text-earth-light dark:text-[#889080]"> defendant: {userName.toLowerCase()}-verified-sig</p>
                    <p className="text-[8px] text-earth-light dark:text-[#889080] truncate max-w-sm"> sha256_hash: {selectedPreviewReport.securityHash}</p>
                  </div>
                  <div className="text-right">
                    <span className="border border-sage-500 dark:border-sage-600 bg-sage-50 dark:bg-[#252b20] text-sage-700 dark:text-sage-300 px-2 py-0.5 rounded font-extrabold text-[9px]">
                      COURT INGESTED
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons inside modal */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => handleDownloadReport(selectedPreviewReport)}
                  className="flex-grow bg-olive-500 hover:bg-olive-600 dark:bg-sage-600 dark:hover:bg-sage-500 text-white py-3 rounded-xl font-bold text-xs transition-all flex justify-center items-center space-x-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD PLAIN TEXT COPY</span>
                </button>
                <button
                  onClick={() => setSelectedPreviewReport(null)}
                  className="bg-[#F0F0EB] dark:bg-[#252b20] text-olive-900 dark:text-[#e3e6de] px-6 py-3 rounded-xl font-bold text-xs hover:bg-[#E8E8E1] dark:hover:bg-[#323a2a] transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
