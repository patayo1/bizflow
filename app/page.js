'use client';
import React, { useState } from 'react';
import { Sparkles, PlusCircle, ArrowDownLeft, ArrowUpRight, Package, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BizFlowHome() {
  const [note, setNote] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResults, setParsedResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [quickMode, setQuickMode] = useState(null);

  const handleParseNote = async () => {
    if (!note.trim()) return;
    setIsParsing(true);
    setErrorMsg('');
    setParsedResults(null);

    try {
      const res = await fetch('/api/parse-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteText: note })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse note');
      }

      setParsedResults(data.transactions);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const formatNaira = (val) => {
    if (!val && val !== 0) return '—';
    return '₦' + Number(val).toLocaleString('en-NG');
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      {/* Header & Branding */}
      <header className="mb-6 flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            BizFlow <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">Cephas Energiez</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Track your business numbers with ease</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
          PA
        </div>
      </header>

      {/* Overview Snapshot */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Available Cash</span>
          <p className="text-xl font-bold text-slate-900 mt-1">₦1,240,000</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <span className="text-xs font-medium text-amber-600">Customers Owe</span>
          <p className="text-xl font-bold text-amber-600 mt-1">₦680,000</p>
        </div>
      </section>

      {/* Heart of App: The AI Notepad */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 mb-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 text-emerald-800 font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>AI Daily Notepad</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Type what happened naturally in plain English (e.g., <em>"Ade paid 200k for Lekki inverter. Bought 4 panels for 420k from Solar World."</em>)
        </p>

        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What happened in your business today?"
          className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
        />

        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={() => setNote('Ade paid 200k for the Lekki inverter project. Bought 4 panels from Solar World for 420k. Paid technician Emeka 50k at Ikeja site.')}
            className="text-[11px] text-emerald-600 hover:underline font-medium"
          >
            + Load sample note
          </button>
          
          <button
            onClick={handleParseNote}
            disabled={isParsing || !note.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            {isParsing ? 'Sorting...' : 'Save & Sort Note'}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* AI Parsed Results Confirmation */}
        {parsedResults && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <p className="text-xs font-semibold text-slate-700">
              Found {parsedResults.length} records in your note:
            </p>
            {parsedResults.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-700">
                      {item.type.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{formatNaira(item.amount)}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                  <p className="text-[11px] text-slate-400">
                    {item.party ? `Party: ${item.party} • ` : ''}
                    {item.project ? `Project: ${item.project}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => alert(`Saved: ${item.description}`)}
                  className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Confirm
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Manual Quick Record Option */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
          <PlusCircle className="w-4 h-4 text-slate-600" />
          <span>Quick Record (Manual)</span>
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          <button 
            onClick={() => setQuickMode('in')}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-2.5 transition text-left"
          >
            <div className="p-2 bg-emerald-600 text-white rounded-lg"><ArrowDownLeft className="w-4 h-4" /></div>
            <div>
              <p className="text-xs font-bold text-slate-800">Money in</p>
              <p className="text-[10px] text-slate-500">Customer payment</p>
            </div>
          </button>

          <button 
            onClick={() => setQuickMode('out')}
            className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center gap-2.5 transition text-left"
          >
            <div className="p-2 bg-red-600 text-white rounded-lg"><ArrowUpRight className="w-4 h-4" /></div>
            <div>
              <p className="text-xs font-bold text-slate-800">Money out</p>
              <p className="text-[10px] text-slate-500">Expense or labour</p>
            </div>
          </button>

          <button 
            onClick={() => setQuickMode('buy_stock')}
            className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-2.5 transition text-left"
          >
            <div className="p-2 bg-blue-600 text-white rounded-lg"><Package className="w-4 h-4" /></div>
            <div>
              <p className="text-xs font-bold text-slate-800">Bought stock</p>
              <p className="text-[10px] text-slate-500">Panels, inverters</p>
            </div>
          </button>

          <button 
            onClick={() => setQuickMode('use_stock')}
            className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl flex items-center gap-2.5 transition text-left"
          >
            <div className="p-2 bg-purple-600 text-white rounded-lg"><Wrench className="w-4 h-4" /></div>
            <div>
              <p className="text-xs font-bold text-slate-800">Used stock</p>
              <p className="text-[10px] text-slate-500">Installation usage</p>
            </div>
          </button>
        </div>

        {quickMode && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3 animate-fadeIn">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 uppercase">Record: {quickMode.replace('_', ' ')}</span>
              <button onClick={() => setQuickMode(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕ Close</button>
            </div>
            <input type="number" placeholder="Amount (₦)" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
            <input type="text" placeholder="Description / Person / Item" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
            <button onClick={() => { alert('Saved successfully!'); setQuickMode(null); }} className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-lg">Save Record</button>
          </div>
        )}
      </section>

      {/* Footer / Status */}
      <footer className="text-center text-xs text-slate-400">
        BizFlow v0.1 • Cephas Tech Studio
      </footer>
    </main>
  );
}
