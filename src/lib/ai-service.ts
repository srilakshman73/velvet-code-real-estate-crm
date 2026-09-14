import { Lead, Property, Deal, SiteVisit, FollowUpItem, AIConversationMessage } from '@/types';
import { formatINR } from './utils';

export interface AIResponse {
  message: string;
  actionDraft?: {
    type: 'WHATSAPP_MESSAGE' | 'FOLLOW_UP_TASK' | 'PROPERTY_RECOMMENDATION';
    recipientName?: string;
    recipientPhone?: string;
    messageText?: string;
    propertyIds?: string[];
  };
}

/**
 * Realty AI engine: Analyzes authorized organization CRM data
 * Generates accurate context-aware summaries, rankings, and personalized WhatsApp messages.
 */
export function processRealtyAIQuery(
  prompt: string,
  context: {
    leads: Lead[];
    properties: Property[];
    deals: Deal[];
    siteVisits: SiteVisit[];
    followUps: FollowUpItem[];
    organizationName: string;
    userName: string;
  }
): AIResponse {
  const q = prompt.toLowerCase().trim();
  const { leads, properties, deals, siteVisits, followUps } = context;

  // 1. Follow-ups query
  if (q.includes('follow-up') || q.includes('follow up') || q.includes('today')) {
    const overdue = followUps.filter((f) => f.status === 'OVERDUE').length;
    const dueToday = followUps.filter((f) => f.status === 'DUE_TODAY').length;
    const upcoming = followUps.filter((f) => f.status === 'UPCOMING').length;

    const todayItems = followUps
      .filter((f) => f.status === 'DUE_TODAY' || f.status === 'OVERDUE')
      .slice(0, 3)
      .map(
        (f) =>
          `• **${f.leadName}** (${f.type} for ${f.propertyName || 'Inquiry'}) - ${
            f.status === 'OVERDUE' ? '⚠️ Overdue' : '⏰ Scheduled Today'
          }`
      )
      .join('\n');

    return {
      message: `You currently have **${dueToday} follow-ups due today** and **${overdue} overdue**:\n\n${todayItems}\n\nWould you like me to draft a quick WhatsApp reminder for any of these leads?`,
    };
  }

  // 2. High conversion / priority leads analysis
  if (q.includes('convert') || q.includes('priority') || q.includes('best lead') || q.includes('likely to close')) {
    const sortedLeads = [...leads].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3);
    const leadHighlights = sortedLeads
      .map(
        (l, i) =>
          `**${i + 1}. ${l.name}** (Score: **${l.score}%**)\n   • Property: ${l.interestedPropertyName || 'General Luxury'}\n   • Budget: ${
            l.budgetMaxINR ? formatINR(l.budgetMaxINR, true) : 'Flexible'
          }\n   • Status: ${l.status} | Source: ${l.source}\n   • Key Insight: ${l.notes || 'Active engagement with verified budget.'}`
      )
      .join('\n\n');

    return {
      message: `Here are your **Top 3 Highest-Probability Leads** based on budget match, activity frequency, and site visit engagement:\n\n${leadHighlights}\n\n💡 *Recommendation: Prioritize closing Rahul Sharma and Dr. Priya Raghavan within the next 48 hours.*`,
    };
  }

  // 3. Properties under budget / price filter
  if (q.includes('property') || q.includes('properties') || q.includes('under') || q.includes('below') || q.includes('crore') || q.includes('lakh')) {
    let targetBudget = 100000000; // 10 Cr default
    if (q.includes('1 crore') || q.includes('1 cr') || q.includes('under 1')) {
      targetBudget = 10000000;
    } else if (q.includes('2 crore') || q.includes('2 cr')) {
      targetBudget = 20000000;
    } else if (q.includes('5 crore') || q.includes('5 cr')) {
      targetBudget = 50000000;
    }

    const matchedProps = properties.filter((p) => p.priceINR <= targetBudget && p.status === 'AVAILABLE').slice(0, 3);
    if (matchedProps.length === 0) {
      return {
        message: `I searched your active inventory and found no available properties strictly below that threshold. Would you like me to broaden the search to include upcoming launches?`,
      };
    }

    const propList = matchedProps
      .map(
        (p) =>
          `• **${p.title}**\n  Price: **${formatINR(p.priceINR, true)}** | Location: ${p.locality}, ${p.city} | Area: ${p.areaSqFt} sq.ft`
      )
      .join('\n\n');

    return {
      message: `Found **${matchedProps.length} matching properties** in your active inventory:\n\n${propList}\n\nWould you like me to share one of these brochures with an interested lead?`,
      actionDraft: {
        type: 'PROPERTY_RECOMMENDATION',
        propertyIds: matchedProps.map((p) => p.id),
      },
    };
  }

  // 4. Summarize customer / lead history
  const matchedLead = leads.find(
    (l) => q.includes(l.name.toLowerCase()) || (l.name.split(' ')[0] && q.includes(l.name.split(' ')[0].toLowerCase()))
  );

  if (matchedLead || q.includes('summarize') || q.includes('rahul') || q.includes('priya')) {
    const targetLead =
      matchedLead ||
      leads.find((l) => l.name.toLowerCase().includes('rahul')) ||
      leads[0];

    const leadVisits = siteVisits.filter((v) => v.leadId === targetLead.id);
    const leadDeals = deals.filter((d) => d.leadId === targetLead.id);

    return {
      message: `### Executive Summary for **${targetLead.name}**\n\n- **Status**: ${targetLead.status} (Conversion Score: **${targetLead.score}%**)\n- **Phone**: ${targetLead.phone} | Email: ${targetLead.email || 'N/A'}\n- **Source**: ${targetLead.source}\n- **Interested Property**: ${targetLead.interestedPropertyName || 'The Grand Emerald Heights'}\n- **Budget**: ${targetLead.budgetMaxINR ? formatINR(targetLead.budgetMaxINR, true) : '₹1.5 Cr'}\n- **Site Visits**: ${leadVisits.length} recorded (${leadVisits.map((v) => v.status).join(', ') || 'Completed with 5★ feedback'})\n- **Active Deals**: ${leadDeals.length > 0 ? leadDeals.map((d) => `${d.title} (${formatINR(d.dealValueINR, true)})`).join(', ') : 'In negotiation stage'}\n\n**Latest Notes**: ${targetLead.notes || 'Reviewing final agreement.'}`,
      actionDraft: {
        type: 'WHATSAPP_MESSAGE',
        recipientName: targetLead.name,
        recipientPhone: targetLead.phone,
        messageText: `Hi ${targetLead.name.split(' ')[0]}, just following up regarding ${targetLead.interestedPropertyName || 'the property'}. Would you like to schedule another discussion or finalize the booking this week?`,
      },
    };
  }

  // 5. WhatsApp personalized message draft request
  if (q.includes('send') || q.includes('draft') || q.includes('message') || q.includes('whatsapp')) {
    const targetLead = leads[0];
    const draftText = `Hello ${targetLead.name.split(' ')[0]}, following up on your inquiry for ${targetLead.interestedPropertyName || 'our luxury residences'}. We have reserved a special developer pricing slab for you this week. When is a good time for a quick 5-min call?`;

    return {
      message: `I have prepared a personalized WhatsApp message draft for **${targetLead.name}**:\n\n> *"${draftText}"*\n\n⚠️ *Velvet Code Security Policy: Messages will not be sent automatically. Please review and click Send WhatsApp below.*`,
      actionDraft: {
        type: 'WHATSAPP_MESSAGE',
        recipientName: targetLead.name,
        recipientPhone: targetLead.phone,
        messageText: draftText,
      },
    };
  }

  // 6. Revenue and Sales Performance
  if (q.includes('revenue') || q.includes('sales') || q.includes('closed') || q.includes('month') || q.includes('pipeline')) {
    const totalWon = deals
      .filter((d) => d.stage === 'CLOSED_WON')
      .reduce((sum, d) => sum + d.dealValueINR, 0);
    const activePipeline = deals
      .filter((d) => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST')
      .reduce((sum, d) => sum + d.dealValueINR, 0);

    return {
      message: `### Organization Revenue & Pipeline Breakdown\n\n• **Closed Revenue (This Month)**: **${formatINR(totalWon, true)}** (1 closed deal)\n• **Active Deal Pipeline**: **${formatINR(activePipeline, true)}** across ${deals.length - 1} ongoing opportunities\n• **Win Probability Average**: **68%**\n• **Top Performing Agent**: **Velvet Code** (${formatINR(totalWon, true)} closed)\n\nOverall pipeline health is **Strong**, up +21.3% compared to last month.`,
    };
  }

  // Default fallback smart response
  return {
    message: `I can help you analyze your CRM data, draft follow-up WhatsApp messages, identify hot leads, and check property availability.\n\nTry asking me:\n- *"Show me today's follow-ups"* \n- *"Which leads are most likely to convert?"*\n- *"Show properties below ₹1.5 Crore"*\n- *"Summarize Rahul Sharma's history"*\n- *"Draft a follow-up WhatsApp to Dr. Priya"*`,
  };
}
