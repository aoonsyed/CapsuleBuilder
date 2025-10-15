import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Toaster, toast } from 'sonner';
import { useSelector } from 'react-redux';
import emailjs from '@emailjs/browser';

export default function Step4bMarketFinancials({ onNext, onBack }) {
  const savedAnswers = JSON.parse(localStorage.getItem('questionnaireAnswers'));
  const [sendingEmail, setSendingEmail] = useState(false);

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
    const schedulingUrl =
      process.env.REACT_APP_SCHEDULING_URL ||
      'https://app.acuityscheduling.com/schedule/c38a96dc/appointment/32120137/calendar/3784845?appointmentTypeIds[]=32120137';
    
    window.open(schedulingUrl, '_blank', 'noopener,noreferrer');
    
    try {
      setSendingEmail(true);
      await sendScheduleEmail();
      toast.success('Your details were emailed to our team.');
    } catch (err) {
      console.error('Email send failed:', err);
      toast.error('We couldn't send the email. We'll still see your booking.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
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
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-[#333333] text-4xl md:text-5xl font-[Albereto Regular] text-center mb-4">
            Market & Financial Analysis
          </h2>
          <p className="text-center text-[#666666] text-lg font-[Garamond] mb-8">
            Understanding your market position and profitability potential
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="container mx-auto px-4 pb-12">
          
          {/* Market & Brand Positioning Section */}
          <div className="mb-8">
            <h3 className="text-3xl font-[Albereto Regular] mb-6 text-[#333333] text-center">
              Market & Brand Positioning
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Comparable Market Examples Card */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-2xl font-[Albereto Regular] mb-4 text-black">Comparable Market Examples</h4>
                <div className="text-lg leading-relaxed text-black font-[Garamond]">
                  {marketExamples ? (
                    <ReactMarkdown>{marketExamples}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>

              {/* Target Consumer Insight Card */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-2xl font-[Albereto Regular] mb-4 text-black">Target Consumer Insight</h4>
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

          {/* Business & Financial Tools Section */}
          <div className="mb-8">
            <h3 className="text-3xl font-[Albereto Regular] mb-6 text-[#333333] text-center">
              Business & Financial Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Margin Analysis Card */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-2xl font-[Albereto Regular] mb-4 text-black">Margin Analysis</h4>
                <div className="text-lg leading-relaxed text-black font-[Garamond]">
                  {marginAnalysis ? (
                    <ReactMarkdown>{marginAnalysis}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-400">No data available</p>
                  )}
                </div>
              </div>

              {/* Wholesale vs DTC Pricing Card */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-2xl font-[Albereto Regular] mb-4 text-black">Wholesale vs DTC Pricing</h4>
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <button
              onClick={handleScheduleClick}
              disabled={sendingEmail}
              className={`px-8 py-3 text-lg font-bold text-white rounded-lg shadow-lg transition-all ${
                sendingEmail ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-[#3A3A3D] hover:shadow-xl'
              }`}
            >
              {sendingEmail ? 'Sending details…' : 'Schedule Call →'}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-white/50 rounded-lg p-6 border-l-4 border-black">
            <h4 className="font-[Albereto Regular] text-xl text-[#333333] mb-2">Ready to move forward?</h4>
            <p className="text-[#666666] font-[Garamond] text-lg">
              Schedule a call with our team to discuss your product vision, review these insights in detail, 
              and explore the next steps in bringing your capsule collection to life.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

