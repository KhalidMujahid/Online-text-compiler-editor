import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError(''); 
    try {
      const response = await axios.post('http://localhost:5000/compile', {
        code,
        language,
      });

      setOutput(response.data.output);
    } catch (err) {
      setError('Error compiling code: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <textarea
        className="flex-grow p-2 border border-gray-300 rounded-lg resize-none"
        placeholder="Type your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <div className="flex items-center mt-4">
        <select
          className="mr-2 p-2 border border-gray-300 rounded-lg"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="JavaScript">JavaScript</option>
          <option value="Python">Python</option>
          <option value="C++">C++</option>
        </select>
        <button
          className="p-2 bg-blue-500 text-white rounded-lg"
          onClick={handleSubmit}
        >
          Compile
        </button>
      </div>
      {error && <div className="mt-2 text-red-500">{error}</div>}
      <textarea
        className="mt-4 p-2 border border-gray-300 rounded-lg resize-none"
        placeholder="Output will be displayed here..."
        value={output}
        readOnly
      />
    </div>
  );
};

export default App;
