import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, X, RefreshCcw, Download, Anchor } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type AppState = 'entry' | 'results';

export default function App() {
  const [appState, setAppState] = useState<AppState>('entry');
  const [error, setError] = useState<string>('');
  
  // Inputs
  const [grossIncome, setGrossIncome] = useState<string>('');
  const [expenses, setExpenses] = useState<string>('');
  const [crewMembers, setCrewMembers] = useState<string>('3');

  // Results
  const [netProfit, setNetProfit] = useState<number>(0);
  const [ownerPayout, setOwnerPayout] = useState<number>(0);
  const [crewPayout, setCrewPayout] = useState<number>(0);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const calculate = () => {
    // Validation
    if (!grossIncome || !expenses || !crewMembers) {
      setError('Please fill out all fields.');
      return;
    }

    const inc = parseFloat(grossIncome);
    const exp = parseFloat(expenses);
    const crew = parseInt(crewMembers);

    if (isNaN(inc) || isNaN(exp) || isNaN(crew) || crew <= 0) {
      setError('Please enter valid numeric values.');
      return;
    }

    setError(''); // Clear error

    // Business Logic
    const profit = inc - exp;
    const totalShares = crew + 0.5; // Owner extra 0.5
    const valuePerShare = profit / totalShares;
    const ownerShare = valuePerShare * 1.5;
    const crewShare = valuePerShare * 1.0;

    setNetProfit(profit);
    setOwnerPayout(ownerShare);
    setCrewPayout(crewShare);
    setAppState('results');
  };

  const clear = () => {
    setGrossIncome('');
    setExpenses('');
    setCrewMembers('3');
    setError('');
  };

  const recalculate = () => {
    setAppState('entry');
    setError('');
  };

  const downloadPDF = async () => {
    if (!resultsRef.current) return;
    
    try {
      // Create a canvas from the results element
      const element = resultsRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0a0a12', // Match neon dark background
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions at standard scale
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const now = new Date();
      const dateString = now.toLocaleDateString();
      const timeString = now.toLocaleTimeString();

      // Title and Date
      pdf.setFontSize(16);
      pdf.text('Zentrix Pro - Trip Calculation', 15, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generated on: ${dateString} at ${timeString}`, 15, 28);
      
      // Add the canvas image
      pdf.addImage(imgData, 'PNG', 15, 35, pdfWidth - 30, (pdfHeight * (pdfWidth - 30)) / pdfWidth);
      
      pdf.save(`Zentrix_Pro_Calculation_${now.getTime()}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const formatCurrency = (val: number) => {
    return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center p-4 relative overflow-x-hidden bg-[#0a0a12] w-full">
      {/* Background ambient glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00ffcc] opacity-5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-[#ff2d78] opacity-5 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-50 border-b border-white/5 bg-[#0a0a12]/80 backdrop-blur-md">
        <h1 className="font-display text-lg tracking-wider">
          <span className="text-[#00ffcc] text-glow-cyan">Zentrix Pro</span>
          <span className="text-white/50 mx-2">/</span>
          <span className="text-[#ff2d78] text-sm md:text-base">{appState === 'entry' ? 'ENTRY_STATE' : 'ADVANCED_RESULTS'}</span>
        </h1>
      </header>

      <main className="w-full max-w-md z-10 pt-24 pb-12 relative flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {appState === 'entry' ? (
            <motion.div
              key="entry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="surface-container rounded-2xl p-8"
            >
              <h2 className="font-display font-bold text-3xl mb-6 text-center text-white">
                Input Data
              </h2>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#ff2d78]/10 border border-[#ff2d78]/50 rounded-lg p-3 text-[#ff2d78] text-sm text-center font-mono box-glow-pink mb-6">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <div>
                  <label className="block font-mono text-sm text-[#00ffcc] mb-2 uppercase tracking-widest">Gross Income</label>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50 pl-3">₹</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={grossIncome}
                      onChange={(e) => setGrossIncome(e.target.value)}
                      className="input-neon w-full py-3 pl-8 pr-4 text-white font-sans text-lg placeholder-white/20 select-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-sm text-[#00ffcc] mb-2 uppercase tracking-widest">Expenses</label>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50 pl-3">₹</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      className="input-neon w-full py-3 pl-8 pr-4 text-white font-sans text-lg placeholder-white/20 select-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-sm text-[#00ffcc] mb-2 uppercase tracking-widest">Crew Members</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={crewMembers}
                    onChange={(e) => setCrewMembers(e.target.value)}
                    className="input-neon w-full py-3 px-4 text-white font-sans text-lg placeholder-white/20 select-all"
                    placeholder="3"
                  />
                </div>

                <div className="flex gap-4 mt-8 pt-4">
                  <button
                    onClick={calculate}
                    className="flex-1 bg-[#0a0a12] border-neon-pink text-white font-mono uppercase tracking-wider py-4 px-4 rounded-xl flex items-center justify-center gap-2 box-glow-pink transition-all active:scale-95 select-none touch-manipulation"
                  >
                    <Calculator size={18} className="text-[#ff2d78]" />
                    <span className="text-glow-pink">Calculate</span>
                  </button>
                  <button
                    onClick={clear}
                    className="flex-1 bg-[#0a0a12] border border-white/20 text-white/70 font-mono uppercase tracking-wider py-4 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all active:scale-95 select-none touch-manipulation"
                  >
                    <X size={18} />
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-full"
            >
              <div ref={resultsRef} className="w-full flex flex-col items-center bg-[#0a0a12]/5 pt-4 pb-2">
                <div className="text-center mb-10">
                  <h2 className="font-mono text-[#00ffcc] uppercase tracking-[0.2em] mb-2">Net Profit</h2>
                  <div className="font-display font-bold text-5xl text-white text-glow-cyan">
                    {formatCurrency(netProfit)}
                  </div>
                </div>

                <div className="surface-container rounded-2xl p-6 w-full mb-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#ff2d78]"></div>
                  
                  <h3 className="font-mono text-sm text-white/50 uppercase tracking-widest mb-4">Trip Details</h3>
                  
                  <div className="space-y-3 font-sans text-sm border-b border-white/10 pb-4 mb-4">
                    <div className="flex justify-between">
                      <span className="text-white/70">Total Income:</span>
                      <span className="text-white">{formatCurrency(parseFloat(grossIncome) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Total Expenses:</span>
                      <span className="text-[#ff2d78]">{formatCurrency(parseFloat(expenses) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Crew Members:</span>
                      <span className="text-white">{crewMembers || 0}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Anchor size={20} className="text-[#ffe04a]" />
                        <span className="font-mono text-white text-sm">Owner (1.5 Shares):</span>
                      </div>
                      <span className="font-display text-[#ffe04a] text-glow-yellow text-lg">
                        {formatCurrency(ownerPayout)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pl-8">
                      <span className="font-mono text-white/70 text-sm">Each Crew (1 Share):</span>
                      <span className="font-display text-white text-lg">
                        {formatCurrency(crewPayout)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 w-full mt-4">
                <button
                  onClick={recalculate}
                  className="flex-1 bg-[#0a0a12] border border-[#00ffcc]/50 text-white font-mono uppercase tracking-wider py-4 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-2 box-glow-cyan transition-all active:scale-95 select-none touch-manipulation text-sm sm:text-base"
                >
                  <RefreshCcw size={18} className="text-[#00ffcc] shrink-0" />
                  <span className="text-glow-cyan">Recalculate</span>
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex-1 bg-[#0a0a12] border-neon-pink text-white font-mono uppercase tracking-wider py-4 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-2 box-glow-pink transition-all active:scale-95 select-none touch-manipulation text-sm sm:text-base"
                >
                  <Download size={18} className="text-[#ff2d78] shrink-0" />
                  <span className="text-glow-pink">Download PDF</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
