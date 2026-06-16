import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Trash2, Upload, X } from "lucide-react";
import * as XLSX from "xlsx";
import { getApprovedCustomers } from "@/api/cusotmerMasterApi";

export default function CustomerList() {

  const [customers, setCustomers] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEntity, setFilterEntity] = useState("All");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importState, setImportState] = useState<{
    isOpen: boolean;
    headers: string[];
    rawData: any[];
    mapping: Record<string, string>;
  }>({ isOpen: false, headers: [], rawData: [], mapping: {} });

  const expectedFields = [
    { key: "customerCode", label: "Customer Code", required: false },
    { key: "name", label: "Company Name", required: true },
    { key: "tradeName", label: "Trade Name", required: false },
    { key: "entityType", label: "Type", required: false },
    { key: "coaCode", label: "COA Code", required: false },
    { key: "receivableAccount", label: "Receivable Account", required: false },
    { key: "celebalEntity", label: "Celebal Entity", required: false },
    { key: "customerCategory", label: "Customer Category", required: false },
    { key: "isIndividual", label: "Is Individual", required: false },
    { key: "firstName", label: "First Name", required: false },
    { key: "middleName", label: "Middle Name", required: false },
    { key: "lastName", label: "Last Name", required: false },
    { key: "email", label: "Email Id", required: false },
    { key: "phone", label: "Phone No", required: false },
    { key: "billingCountry", label: "Billing Country", required: false },
    { key: "billingAddress1", label: "Billing Address 1", required: false },
    { key: "billingAddress2", label: "Billing Address 2", required: false },
    { key: "address3", label: "Address 3", required: false },
    { key: "city", label: "City", required: false },
    { key: "billingState", label: "Billing State", required: false },
    { key: "billingPincode", label: "Billing Pincode", required: false },
    { key: "gstn", label: "Billing GSTN", required: false },
    { key: "taxRegCountry", label: "Tax Registration country", required: false },
    { key: "taxRegState", label: "Tax Registration State", required: false },
    { key: "taxRegNumber", label: "Tax Registration Number", required: false },
    { key: "terms", label: "TERMS", required: false },
    { key: "currency", label: "Currency", required: false },
    { key: "registrationType", label: "Registration Type", required: false },
    { key: "pan", label: "PAN No", required: false },
    { key: "aadhar", label: "Addhar No", required: false },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data.length > 0) {
        const headers = data[0] as string[];
        const rawData = data.slice(1).map(row => {
          const rowData: any = {};
          headers.forEach((h, i) => {
            rowData[h] = (row as any)[i];
          });
          return rowData;
        }).filter(row => Object.keys(row).length > 0);

        // Auto-map
        const mapping: Record<string, string> = {};
        expectedFields.forEach(f => {
          // 1. Exact match (case insensitive)
          let match = headers.find(h => h.toLowerCase().trim() === f.label.toLowerCase().trim());
          // 2. Partial match (e.g., "Billling Pincode" vs "Billing Pincode")
          if (!match) {
            match = headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '').includes(f.label.toLowerCase().replace(/[^a-z0-9]/g, '')));
          }
          if (match) mapping[f.key] = match;
        });

        setImportState({ isOpen: true, headers, rawData, mapping });
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeImport = () => {
    const newRecords = importState.rawData.map((row) => {
      let entityType = row[importState.mapping["entityType"]] || "Customer";
      const customerCode = row[importState.mapping["customerCode"]];
      
      // Infer entity type from Customer Code if available
      if (customerCode) {
        if (String(customerCode).toUpperCase().startsWith("VN")) {
          entityType = "Vendor";
        } else if (String(customerCode).toUpperCase().startsWith("CN")) {
          entityType = "Customer";
        }
      }

      const prefix = entityType.toLowerCase() === "vendor" ? "VN" : "CN";
      const generatedId = `${prefix}-IMP${Math.floor(Math.random() * 10000)}`;
      const finalId = customerCode || generatedId;

      return {
        id: finalId,
        name: row[importState.mapping["name"]] || "Unknown",
        gstn: row[importState.mapping["gstn"]] || "N/A",
        pan: row[importState.mapping["pan"]] || "N/A",
        type: row[importState.mapping["registrationType"]] || "Regular",
        currency: row[importState.mapping["currency"]] || "INR",
        status: "Active",
        entityType: entityType.charAt(0).toUpperCase() + entityType.slice(1),
      };
    });

    setCustomers([...newRecords, ...customers]);
    setImportState({ isOpen: false, headers: [], rawData: [], mapping: {} });
  };

  const deleteCustomer = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const filteredCustomers = customers.filter((c) => {
  const name = (c.name || "").toLowerCase();
  const id = (c.id || "").toLowerCase();
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    name.includes(search) || id.includes(search);

  const matchesEntity =
    filterEntity === "All" || c.entityType === filterEntity;

  return matchesSearch && matchesEntity;
});

const fetchApprovedCustomers = useCallback(async () => {
  try {
    const res = await getApprovedCustomers();
    // const rawData = res.data || (Array.isArray(res) ? res : []);
    const rawData = Array.isArray(res?.data) ? res.data : [];
    
    const mapped = rawData.map((item: any) => ({
  id: item.DisplayId || item.RecordId,   // ✅ better

  name: item.CompanyName || "Unknown",
  gstn: item.GSTIN || "N/A",               
  pan: item.PAN || "N/A",

  type: item.RegistrationType || "Regular",
  currency: item.Currency || "INR",

  status: item.Status || "Approved",
  entityType: item.Source || "Customer",
}));

    setCustomers(mapped);
  } catch (err) {
    console.error("Failed to fetch approved customers:", err);
  }
}, []);

useEffect(() => {
  fetchApprovedCustomers();
}, [fetchApprovedCustomers]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Master Records</h1>
          <p className="text-slate-500">View and manage synced Customers and Vendors</p>
        </div>
        <div>
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle>All Records ({filteredCustomers.length})</CardTitle>
            <div className="flex gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Search records..." 
                  className="pl-9" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
              >
                <option value="All">All Entities</option>
                <option value="Customer">Customers Only</option>
                <option value="Vendor">Vendors Only</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Entity Type</th>
                  <th className="px-4 py-3 font-medium">Company Name</th>
                  <th className="px-4 py-3 font-medium">GSTN</th>
                  <th className="px-4 py-3 font-medium">PAN</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Currency</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-blue-600">{customer.id}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={customer.entityType === 'Vendor' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}>
                        {customer.entityType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{customer.name}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{customer.gstn}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{customer.pan}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-normal">{customer.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{customer.currency}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => deleteCustomer(customer.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No records found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Import Mapping Modal */}
      {importState.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Map Excel Columns</h2>
              <button onClick={() => setImportState({...importState, isOpen: false})} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              We found {importState.rawData.length} records in your file. Please map your Excel columns to the system fields.
            </p>
            
            <div className="space-y-4">
              {expectedFields.map(field => (
                <div key={field.key} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="w-1/2 font-medium text-sm text-slate-700">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </div>
                  <div className="w-1/2">
                    <select 
                      className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
                      value={importState.mapping[field.key] || ""}
                      onChange={(e) => setImportState({
                        ...importState, 
                        mapping: { ...importState.mapping, [field.key]: e.target.value }
                      })}
                    >
                      <option value="">-- Ignore this field --</option>
                      {importState.headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setImportState({...importState, isOpen: false})}>Cancel</Button>
              <Button onClick={executeImport}>Import {importState.rawData.length} Records</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
