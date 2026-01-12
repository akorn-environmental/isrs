const axios = require('axios');

class GrantsService {
  constructor() {
    this.baseURL = 'https://www.grants.gov/grantsws/rest';
    this.apiKey = process.env.GRANTS_GOV_API_KEY;
  }

  async searchOpportunities(params = {}) {
    try {
      const {
        keyword = '',
        fundingInstrument = '',
        eligibility = '',
        category = '',
        rows = 25,
        offset = 0
      } = params;

      const queryParams = new URLSearchParams();
      if (this.apiKey) queryParams.append('api_key', this.apiKey);
      if (keyword) queryParams.append('keyword', keyword);
      if (fundingInstrument) queryParams.append('fundingInstrument', fundingInstrument);
      if (eligibility) queryParams.append('eligibility', eligibility);
      if (category) queryParams.append('category', category);
      queryParams.append('rows', rows);
      queryParams.append('offset', offset);

      const response = await axios.get(
        `${this.baseURL}/opportunities/search.json?${queryParams.toString()}`,
        {
          timeout: 30000,
          headers: { 'Accept': 'application/json' }
        }
      );

      return {
        success: true,
        data: response.data,
        total: response.data.totalRecords || 0,
        opportunities: response.data.opportunityList || []
      };

    } catch (error) {
      console.error('Grants.gov search error:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async fetchOpportunity(oppId) {
    try {
      const queryParams = new URLSearchParams();
      if (this.apiKey) queryParams.append('api_key', this.apiKey);
      queryParams.append('oppId', oppId);

      const response = await axios.get(
        `${this.baseURL}/opportunity/details.json?${queryParams.toString()}`,
        {
          timeout: 30000,
          headers: { 'Accept': 'application/json' }
        }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('Grants.gov fetch error:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async searchMarineGrants() {
    const keywords = ['marine', 'coastal', 'fisheries', 'ocean', 'aquatic', 'maritime'];
    const results = [];

    for (const keyword of keywords) {
      const response = await this.searchOpportunities({ keyword, rows: 50 });
      if (response.success) {
        results.push(...response.opportunities);
      }
    }

    const unique = Array.from(new Map(results.map(g => [g.id, g])).values());

    return {
      success: true,
      total: unique.length,
      opportunities: unique
    };
  }

  async searchByCategory(category) {
    return this.searchOpportunities({ category, rows: 100 });
  }
}

module.exports = new GrantsService();
