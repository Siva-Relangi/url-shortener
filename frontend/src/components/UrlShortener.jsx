import React, { useState, useEffect } from 'react';
import { Link, BarChart3, Copy, ExternalLink, Trash2, RefreshCw } from 'lucide-react';

const URLShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customShortId, setCustomShortId] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [urls, setUrls] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [activeTab, setActiveTab] = useState('create');
  const [notification, setNotification] = useState('');

  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchAllUrls();
    }
  }, [activeTab]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const shortenUrl = async () => {
    if (!originalUrl.trim()) {
      showNotification('Please enter a URL');
      return;
    }

    if (!validateUrl(originalUrl)) {
      showNotification('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: originalUrl,
          customId: customShortId || undefined
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const shortUrl = `${API_BASE}/${data.id}`;
        setGeneratedUrl(shortUrl);
        setOriginalUrl('');
        setCustomShortId('');
        showNotification('URL shortened successfully!');
      } else {
        showNotification(data.error || 'Failed to shorten URL');
      }
    } catch (error) {
      showNotification('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUrls = async () => {
    try {
      const response = await fetch(`${API_BASE}/url`);
      const data = await response.json();
      if (response.ok) {
        setUrls(data);
        // Fetch analytics for each URL
        data.forEach(url => fetchAnalytics(url.shortId));
      }
    } catch (error) {
      showNotification('Failed to fetch URLs');
    }
  };

  const fetchAnalytics = async (shortId) => {
    try {
      const response = await fetch(`${API_BASE}/url/analytics/${shortId}`);
      const data = await response.json();
      if (response.ok) {
        setAnalytics(prev => ({
          ...prev,
          [shortId]: data.Analytics
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch analytics for ${shortId}`);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Copied to clipboard!');
    } catch (error) {
      showNotification('Failed to copy');
    }
  };

  const refreshAnalytics = () => {
    urls.forEach(url => fetchAnalytics(url.shortId));
    showNotification('Analytics refreshed!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <Link className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">URL Shortener</h1>
          <p className="text-gray-600">Transform long URLs into short, shareable links</p>
        </div>

        {/* Notification */}
        {notification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
            {notification}
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              Create Short URL
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'manage'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              Manage URLs
            </button>
          </div>
        </div>

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            {/* URL Shortener Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original URL *
                  </label>
                  <input
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="Enter original URL"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Short ID (Optional)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={customShortId}
                      onChange={(e) => setCustomShortId(e.target.value)}
                      placeholder="my-custom-id"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Leave blank to generate a random ID
                  </p>
                </div>

                <button
                  onClick={shortenUrl}
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Link className="w-5 h-5" />
                  )}
                  <span>{isLoading ? 'Shortening...' : 'Shorten URL'}</span>
                </button>
              </div>
            </div>

            {/* Generated URL Display */}
            {generatedUrl && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  🎉 Your shortened URL is ready!
                </h3>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={generatedUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedUrl)}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="max-w-6xl mx-auto">
            {/* Manage URLs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Manage Your URLs
                  </h2>
                  <button
                    onClick={refreshAnalytics}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                        Short ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                        Original URL
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                        Clicks
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {urls.map((url) => (
                      <tr key={url._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {url.shortId}
                            </code>
                            <button
                              onClick={() => copyToClipboard(`${API_BASE}/${url.shortId}`)}
                              className="text-gray-500 hover:text-indigo-600"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-sm text-gray-600">
                            {url.redirectUrl}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="w-4 h-4 text-indigo-600" />
                            <span className="font-medium">
                              {analytics[url.shortId] || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <a
                              href={`${API_BASE}/${url.shortId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {urls.length === 0 && (
                  <div className="text-center py-12">
                    <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No URLs found. Create your first short URL!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default URLShortener;
