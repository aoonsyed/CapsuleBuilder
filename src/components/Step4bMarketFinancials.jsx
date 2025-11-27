import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { useSelector } from 'react-redux';
import emailjs from '@emailjs/browser';

export default function Step4bMarketFinancials({ onNext, onBack }) {
  const savedAnswers = JSON.parse(localStorage.getItem('questionnaireAnswers'));
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const formData = useSelector((state) => state.form);
  const {
    localBrand,
    brand2,
    productType,
  } = formData;

  const title = localBrand?.trim()
    ? `${localBrand.trim()} ${productType?.trim()}`
    : `Your ${productType?.trim()}`;

  // Get suggestions from localStorage
  const rawAnswer = localStorage.getItem('answer') || '';
  const suggestions = JSON.parse(localStorage.getItem('parsedSuggestions') || '{}');

  // Parse sections for this screen
  const getSection = (label) => {
    const patterns = [
      new RegExp(`\\*\\*${label}\\*\\*\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'),
      new RegExp(`\\*\\*${label}\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'),
      new RegExp(`${label}\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i'),
    ];
    
    for (const pattern of patterns) {
      const match = rawAnswer.match(pattern);
      if (match && match[1] && match[1].trim()) {
        return match[1].trim();
      }
    }
    return '';
  };

  const marketExamples = suggestions.marketExamples || getSection('Comparable Market Examples');
  const targetInsight = suggestions.targetInsight || getSection('Target Consumer Insight');
  const marginAnalysis = suggestions.marginAnalysis || getSection('Margin Analysis');
  const pricing = suggestions.pricing || getSection('Wholesale vs. DTC Pricing') || getSection('Wholesale vs DTC Pricing') || getSection('Wholesale vs DTC');
  const yieldConsumption = suggestions.yieldConsumption || getSection('Yield & Consumption Estimates');
  const leadTime = suggestions.leadTime || getSection('Production Lead Time Estimate');

  // Build email params
  const buildEmailParams = () => {
    const recipient = process.env.REACT_APP_TEAM_RECEIVER_EMAIL;
    const customerEmail =
      savedAnswers?.email || savedAnswers?.contactEmail || savedAnswers?.userEmail || '';

    return {
      to_email: recipient,
      customer_email: customerEmail,
      title,
      brand: brand2 || localBrand || '',
      product_type: productType || '',
      raw_answer: rawAnswer,
      scheduling_url:
        process.env.REACT_APP_SCHEDULING_URL ||
        'https://app.acuityscheduling.com/schedule/c38a96dc/appointment/32120137/calendar/3784845?appointmentTypeIds[]=32120137',
    };
  };

  // Send email
  const sendScheduleEmail = async () => {
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) throw new Error('Missing EmailJS env vars');
    const templateParams = buildEmailParams();
    return emailjs.send(serviceId, templateId, templateParams, { publicKey });
  };

  const handleScheduleClick = async () => {
    // Get customer_id from URL
    const params = new URLSearchParams(window.location.search);
    const customerId = params.get("customer_id");
    
    if (!customerId) {
      toast.error('Customer ID not found. Please try again.');
      return;
    }

    // Validate submission with backend
    try {
      setSendingEmail(true);
      const response = await fetch(
        `https://backend-capsule-builder.onrender.com/proxy/validate-submission?logged_in_customer_id=${customerId}`
      );
      
      const data = await response.json();
      
      if (!data.ok) {
        // User is not subscribed or trial already used
        if (data.reason === 'no_active_subscription') {
          setShowSubscribeModal(true);
          setSendingEmail(false);
          return;
        } else {
          toast.error(data.message || 'Unable to validate submission. Please try again.');
          setSendingEmail(false);
          return;
        }
      }
      
      // Validation passed - proceed with scheduling
      const schedulingUrl =
        process.env.REACT_APP_SCHEDULING_URL ||
        'https://app.acuityscheduling.com/schedule/c38a96dc/appointment/32120137/calendar/3784845?appointmentTypeIds[]=32120137';
      
      window.open(schedulingUrl, '_blank', 'noopener,noreferrer');
      
      await sendScheduleEmail();
      toast.success('Your details were emailed to our team.');
    } catch (err) {
      console.error('Validation or email send failed:', err);
      toast.error('We encountered an error. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSubscribeClick = () => {
    window.location.href = 'https://formdepartment.com/pages/about?view=subscription-plans';
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      
      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-xl">
            <h3 className="text-2xl font-bold text-black mb-4">Subscribe to Schedule Your Call</h3>
            <p className="text-gray-700 mb-6">
              You need an active subscription to schedule a call. Please subscribe to continue.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleSubscribeClick}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-[#3A3A3D] transition"
              >
                View Plans
              </button>
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-[#E8E8E8] min-h-screen">
        {/* Header with Back Button */}
        <div className="bg-[#E8E8E8]">
          <div className="container mx-auto px-4 py-6">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-white bg-black hover:bg-[#3A3A3D] rounded-md transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Title Section */}
        <div className="w-full px-6 py-8">
          <h2 className="text-[#333333] text-4xl md:text-5xl font-[Albereto Regular] text-center mb-12">
            Production & Market Analysis
          </h2>
        </div>

        {/* Main Content - Full Width Layout */}
        <div className="w-full px-6 pb-12">
          
          {/* Production Timeline Section */}
          <div className="mb-10">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Yield Card - Takes 2 columns on large screens */}
              <div className="xl:col-span-2 bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="text-2xl font-[Albereto Regular] text-black">Yield & Consumption Estimates</h3>
                </div>
                <div className="text-lg leading-relaxed text-black font-[Garamond] pl-13">
                  {yieldConsumption ? <ReactMarkdown>{yieldConsumption}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
                </div>
              </div>

              {/* Lead Time Card - Takes 1 column */}
              <div className="xl:col-span-1 bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-[Albereto Regular] text-black">Lead Time</h3>
                </div>
                <div className="text-lg leading-relaxed text-black font-[Garamond] pl-13">
                  {leadTime ? <ReactMarkdown>{leadTime}</ReactMarkdown> : <p className="text-gray-400">No data available</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Market Positioning Section */}
          <div className="mb-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Comparable Market Examples */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <h4 className="text-2xl font-[Albereto Regular] mb-6 text-black">Comparable Market Examples</h4>
                <div className="text-lg leading-relaxed text-black font-[Garamond]">
                  {marketExamples ? (
                    <ReactMarkdown>{marketExamples}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>

              {/* Target Consumer */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <h4 className="text-2xl font-[Albereto Regular] mb-6 text-black">Target Consumer Insight</h4>
                <div className="text-lg leading-relaxed text-black font-[Garamond]">
                  {targetInsight ? (
                    <ReactMarkdown>{targetInsight}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Analysis Section */}
          <div className="mb-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Margin Analysis */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <h4 className="text-2xl font-[Albereto Regular] mb-6 text-black">Margin Analysis</h4>
                <div className="text-lg leading-relaxed text-black font-[Garamond]">
                  {marginAnalysis ? (
                    <ReactMarkdown>{marginAnalysis}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>

              {/* Pricing Strategy */}
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <h4 className="text-2xl font-[Albereto Regular] mb-6 text-black">Wholesale vs DTC Pricing</h4>
                <div className="text-lg leading-relaxed text-black font-[Garamond]">
                  {pricing ? (
                    <ReactMarkdown>{pricing}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Call Button */}
          <div className="text-center mt-16 mb-8">
            <button
              onClick={handleScheduleClick}
              disabled={sendingEmail}
              className={`px-10 py-4 text-lg font-bold text-white rounded-lg shadow-lg transition-all ${
                sendingEmail ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-[#3A3A3D] hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {sendingEmail ? 'Sending details…' : 'Schedule Call →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

