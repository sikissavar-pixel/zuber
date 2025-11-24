import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";

interface ApplicationCardProps {
  data: any;
  type: "partner" | "driver";
  isApplication?: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function ApplicationCard({
  data,
  type,
  isApplication = false,
  onApprove,
  onReject,
  onDelete,
}: ApplicationCardProps) {
  const isPartner = type === "partner";
  
  // Data normalization
  const id = data.id;
  const name = isPartner ? data.name : data.full_name;
  const email = isPartner ? data.contact_email : data.email;
  const phone = isPartner ? data.contact_phone : (data.contact_phone || data.phone);
  // For partner: contact person name. For driver: license number
  const detail = isPartner ? (data.contact_full_name || "Yetkili Belirtilmemiş") : `Ehliyet: ${data.license_no || "-"}`;
  // For partner: city. For driver: plate/model
  const subDetail = isPartner ? data.city : `${data.vehicle_plate || "?"} - ${data.vehicle_model || "?"}`;
  const description = data.description || "";
  const date = data.created_at ? new Date(data.created_at).toLocaleDateString("tr-TR") : "";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="group relative w-full bg-zinc-900/40 backdrop-blur-md border border-yellow-900/20 rounded-xl p-4 hover:border-yellow-500/30 hover:bg-zinc-900/60 transition-all duration-300 overflow-hidden mb-3"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* ID */}
        <div className="col-span-1 flex items-center justify-start">
           <div className="h-8 w-8 rounded-full bg-yellow-900/20 border border-yellow-700/30 flex items-center justify-center text-yellow-500 font-bold font-mono text-xs">
             #{id}
           </div>
        </div>

        {/* Name & Role */}
        <div className="col-span-1 md:col-span-3 flex flex-col">
           <h3 className="text-base font-semibold text-zinc-100 group-hover:text-yellow-400 transition-colors truncate" title={name}>
             {name || "Bilinmeyen İsim"}
           </h3>
           <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
             {isPartner ? "PARTNER" : "SÜRÜCÜ"}
           </span>
        </div>

        {/* Contact */}
        <div className="col-span-1 md:col-span-3 flex flex-col gap-1 text-sm text-zinc-400">
           <div className="flex items-center gap-2 overflow-hidden">
             <span className="text-yellow-600/70 text-xs">✉</span> 
             <span className="truncate text-xs" title={email}>{email || "-"}</span>
           </div>
           <div className="flex items-center gap-2 overflow-hidden">
             <span className="text-yellow-600/70 text-xs">📞</span>
             <span className="truncate text-xs" title={phone}>{phone || "-"}</span>
           </div>
        </div>

        {/* Details */}
        <div className="col-span-1 md:col-span-3 flex flex-col gap-1 text-sm text-zinc-400">
           <div className="truncate text-zinc-300 text-xs font-medium">{detail}</div>
           <div className="truncate text-zinc-500 text-[10px]">{subDetail}</div>
           {description && <div className="truncate text-[10px] italic text-zinc-600" title={description}>{description}</div>}
           {date && <div className="text-[10px] text-zinc-700 mt-1">{date}</div>}
        </div>

        {/* Actions */}
        <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
           {isApplication ? (
             <>
               <Button 
                 onClick={() => onApprove?.(id)} 
                 className="h-8 bg-yellow-600/20 hover:bg-yellow-500 text-yellow-500 hover:text-black border border-yellow-600/50 px-3 text-[10px] font-medium transition-colors"
               >
                 Onayla
               </Button>
               <Button 
                 variant="secondary" 
                 onClick={() => onReject?.(id)}
                 className="h-8 bg-red-900/10 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-3 text-[10px] font-medium transition-colors"
               >
                 Reddet
               </Button>
             </>
           ) : (
             <Button 
               variant="secondary" 
               onClick={() => onDelete?.(id)}
               className="h-8 bg-red-900/10 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-3 text-[10px] font-medium transition-colors"
             >
               Sil
             </Button>
           )}
        </div>
      </div>
    </motion.div>
  );
}
