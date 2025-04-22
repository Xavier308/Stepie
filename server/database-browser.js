// database-browser.js - Simple database browser for the SQLite database
const express = require('express');
const path = require('path');

// Create a router for the database browser
const createDatabaseBrowser = (db) => {
  const router = express.Router();
  
  // Serve simple HTML interface
  router.get('/', async (req, res) => {
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stepie Database Browser</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.5;
              color: #333;
              max-width: 1200px;
              margin: 0 auto;
              padding: 1rem;
            }
            h1 { color: #FFA000; }
            h2 { margin-top: 2rem; color: #FF8F00; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 1rem 0;
              overflow-x: auto;
              display: block;
            }
            th, td {
              text-align: left;
              padding: 0.5rem;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            tr:nth-child(even) { background-color: #f9fafb; }
            tr:hover { background-color: #f3f4f6; }
            .table-container {
              max-height: 500px;
              overflow-y: auto;
              margin-bottom: 2rem;
              border: 1px solid #e5e7eb;
              border-radius: 0.375rem;
            }
            .actions {
              display: flex;
              gap: 0.5rem;
              margin-bottom: 1rem;
            }
            button, .button {
              background-color: #FFA000;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 0.375rem;
              cursor: pointer;
              font-size: 0.875rem;
              text-decoration: none;
              display: inline-block;
            }
            button:hover, .button:hover {
              background-color: #FF8F00;
            }
            .button-secondary {
              background-color: #e5e7eb;
              color: #4b5563;
            }
            .button-secondary:hover {
              background-color: #d1d5db;
            }
            .button-danger {
              background-color: #ef4444;
            }
            .button-danger:hover {
              background-color: #dc2626;
            }
            .query-box {
              width: 100%;
              padding: 0.75rem;
              border: 1px solid #e5e7eb;
              border-radius: 0.375rem;
              font-family: monospace;
              margin-bottom: 0.5rem;
            }
            .warning {
              background-color: #fff7ed;
              border-left: 4px solid #f97316;
              padding: 1rem;
              margin: 1rem 0;
              border-radius: 0.375rem;
            }
          </style>
        </head>
        <body>
          <h1>Stepie Database Browser</h1>
          <p>View and manage your SQLite database records</p>
          
          <div class="warning">
            <strong>Warning:</strong> This tool is for development purposes only. Do not use in production environments as it exposes your database to potential security risks.
          </div>
          
          <div class="actions">
            <a href="/db-browser/" class="button">Refresh</a>
            <a href="/" class="button button-secondary">Back to App</a>
          </div>
          
          <h2>Tables</h2>
          <div class="actions">
            ${tables.map(table => 
              `<a href="/db-browser/table/${table.name}" class="button">${table.name}</a>`
            ).join('')}
          </div>
          
          <h2>Custom SQL Query</h2>
          <form action="/db-browser/query" method="post">
            <textarea name="sql" rows="4" class="query-box" placeholder="SELECT * FROM users LIMIT 10"></textarea>
            <button type="submit">Execute Query</button>
          </form>
          
          <footer style="margin-top: 2rem; border-top: 1px solid #e5e7eb; padding-top: 1rem; color: #6b7280; font-size: 0.875rem;">
            Stepie Database Browser | SQLite Version
          </footer>
        </body>
      </html>
    `);
  });
  
  // Show table records
  router.get('/table/:name', async (req, res) => {
    try {
      const tableName = req.params.name;
      
      // Validate table name to prevent SQL injection
      const tables = await db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
      const tableNames = tables.map(t => t.name);
      
      if (!tableNames.includes(tableName)) {
        return res.status(404).send('Table not found');
      }
      
      // Get table schema
      const schema = await db.all(`PRAGMA table_info(${tableName})`);
      
      // Get table data (limit to 100 rows for performance)
      const rows = await db.all(`SELECT * FROM ${tableName} LIMIT 100`);
      const rowCount = await db.get(`SELECT COUNT(*) as count FROM ${tableName}`);
      
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${tableName} - Stepie Database Browser</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                line-height: 1.5;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
                padding: 1rem;
              }
              h1 { color: #FFA000; }
              h2 { margin-top: 2rem; color: #FF8F00; }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
              }
              th, td {
                text-align: left;
                padding: 0.5rem;
                border-bottom: 1px solid #e5e7eb;
              }
              th {
                background-color: #f9fafb;
                font-weight: 600;
              }
              tr:nth-child(even) { background-color: #f9fafb; }
              tr:hover { background-color: #f3f4f6; }
              .table-container {
                max-height: 500px;
                overflow-y: auto;
                margin-bottom: 2rem;
                border: 1px solid #e5e7eb;
                border-radius: 0.375rem;
                overflow-x: auto;
              }
              .actions {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
              }
              button, .button {
                background-color: #FFA000;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 0.375rem;
                cursor: pointer;
                font-size: 0.875rem;
                text-decoration: none;
                display: inline-block;
              }
              button:hover, .button:hover {
                background-color: #FF8F00;
              }
              .button-secondary {
                background-color: #e5e7eb;
                color: #4b5563;
              }
              .button-secondary:hover {
                background-color: #d1d5db;
              }
              .button-danger {
                background-color: #ef4444;
              }
              .button-danger:hover {
                background-color: #dc2626;
              }
              .small {
                font-size: 0.875rem;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <h1>Table: ${tableName}</h1>
            <p class="small">Total records: ${rowCount.count} (showing maximum 100)</p>
            
            <div class="actions">
              <a href="/db-browser/" class="button button-secondary">Back to Tables</a>
              <a href="/db-browser/table/${tableName}" class="button">Refresh</a>
            </div>
            
            <h2>Schema</h2>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Type</th>
                    <th>Not Null</th>
                    <th>Default Value</th>
                    <th>Primary Key</th>
                  </tr>
                </thead>
                <tbody>
                  ${schema.map(col => `
                    <tr>
                      <td>${col.name}</td>
                      <td>${col.type || 'N/A'}</td>
                      <td>${col.notnull ? 'Yes' : 'No'}</td>
                      <td>${col.dflt_value ?? 'NULL'}</td>
                      <td>${col.pk ? 'Yes' : 'No'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <h2>Data</h2>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    ${schema.map(col => `<th>${col.name}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(row => `
                    <tr>
                      ${schema.map(col => {
                        let value = row[col.name];
                        // Handle special cases
                        if (value === null) return '<td><em>NULL</em></td>';
                        if (typeof value === 'object') value = JSON.stringify(value);
                        // Handle long values
                        if (typeof value === 'string' && value.length > 100) {
                          value = value.slice(0, 100) + '...';
                        }
                        return `<td>${value}</td>`;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  });
  
  // Process custom SQL query
  router.post('/query', express.urlencoded({ extended: true }), async (req, res) => {
    try {
      const { sql } = req.body;
      
      if (!sql) {
        return res.redirect('/db-browser/');
      }
      
      // Check if it's a SELECT query
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      
      let results;
      if (isSelect) {
        results = await db.all(sql);
      } else {
        // For non-SELECT queries, execute and get modified row count
        const result = await db.run(sql);
        results = [{ message: `Query executed successfully. Rows affected: ${result.changes}` }];
      }
      
      // Create column headers from first result
      const columns = results.length > 0 ? Object.keys(results[0]) : [];
      
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>SQL Query Results - Stepie Database Browser</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                line-height: 1.5;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
                padding: 1rem;
              }
              h1 { color: #FFA000; }
              h2 { margin-top: 2rem; color: #FF8F00; }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
              }
              th, td {
                text-align: left;
                padding: 0.5rem;
                border-bottom: 1px solid #e5e7eb;
              }
              th {
                background-color: #f9fafb;
                font-weight: 600;
              }
              tr:nth-child(even) { background-color: #f9fafb; }
              tr:hover { background-color: #f3f4f6; }
              .table-container {
                max-height: 500px;
                overflow-y: auto;
                margin-bottom: 2rem;
                border: 1px solid #e5e7eb;
                border-radius: 0.375rem;
                overflow-x: auto;
              }
              .actions {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
              }
              button, .button {
                background-color: #FFA000;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 0.375rem;
                cursor: pointer;
                font-size: 0.875rem;
                text-decoration: none;
                display: inline-block;
              }
              button:hover, .button:hover {
                background-color: #FF8F00;
              }
              .button-secondary {
                background-color: #e5e7eb;
                color: #4b5563;
              }
              .button-secondary:hover {
                background-color: #d1d5db;
              }
              pre {
                background-color: #f9fafb;
                padding: 0.75rem;
                border-radius: 0.375rem;
                overflow-x: auto;
                margin: 1rem 0;
                font-size: 0.875rem;
              }
              .query-box {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #e5e7eb;
                border-radius: 0.375rem;
                font-family: monospace;
                margin-bottom: 0.5rem;
                font-size: 0.875rem;
              }
              .small {
                font-size: 0.875rem;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <h1>SQL Query Results</h1>
            
            <div class="actions">
              <a href="/db-browser/" class="button button-secondary">Back to Tables</a>
              <a href="/db-browser/query" class="button button-secondary">New Query</a>
            </div>
            
            <h2>Query</h2>
            <pre>${sql}</pre>
            
            <form action="/db-browser/query" method="post">
              <textarea name="sql" rows="4" class="query-box">${sql}</textarea>
              <button type="submit">Execute Query</button>
            </form>
            
            <h2>Results</h2>
            <p class="small">${results.length} row(s) returned</p>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    ${columns.map(col => `<th>${col}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${results.map(row => `
                    <tr>
                      ${columns.map(col => {
                        let value = row[col];
                        // Handle special cases
                        if (value === null) return '<td><em>NULL</em></td>';
                        if (typeof value === 'object') value = JSON.stringify(value);
                        // Handle long values
                        if (typeof value === 'string' && value.length > 100) {
                          value = value.slice(0, 100) + '...';
                        }
                        return `<td>${value}</td>`;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>SQL Query Error - Stepie Database Browser</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                line-height: 1.5;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
                padding: 1rem;
              }
              h1 { color: #FFA000; }
              .error {
                background-color: #fee2e2;
                border-left: 4px solid #ef4444;
                padding: 1rem;
                margin: 1rem 0;
                border-radius: 0.375rem;
              }
              pre {
                background-color: #f9fafb;
                padding: 0.75rem;
                border-radius: 0.375rem;
                overflow-x: auto;
                margin: 1rem 0;
                font-size: 0.875rem;
              }
              .actions {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
              }
              button, .button {
                background-color: #FFA000;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 0.375rem;
                cursor: pointer;
                font-size: 0.875rem;
                text-decoration: none;
                display: inline-block;
              }
              .button-secondary {
                background-color: #e5e7eb;
                color: #4b5563;
              }
              .query-box {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #e5e7eb;
                border-radius: 0.375rem;
                font-family: monospace;
                margin-bottom: 0.5rem;
                font-size: 0.875rem;
              }
            </style>
          </head>
          <body>
            <h1>SQL Query Error</h1>
            
            <div class="actions">
              <a href="/db-browser/" class="button button-secondary">Back to Tables</a>
            </div>
            
            <div class="error">
              <strong>Error:</strong> ${error.message}
            </div>
            
            <h2>Query</h2>
            <pre>${req.body.sql || ''}</pre>
            
            <form action="/db-browser/query" method="post">
              <textarea name="sql" rows="4" class="query-box">${req.body.sql || ''}</textarea>
              <button type="submit">Execute Query</button>
            </form>
          </body>
        </html>
      `);
    }
  });
  
  return router;
};

module.exports = createDatabaseBrowser;