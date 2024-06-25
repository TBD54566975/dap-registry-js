export default eventHandler((event) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DAP Registry</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            text-align: center;
        }
        h1 {
            color: #333;
        }
        p {
            color: #666;
            font-size: 18px;
            line-height: 1.6;
            text-align: left;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            font-size: 18px;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>DAP Registry</h1>
        <p>To get started, please visit our documentation on GitHub.</p>
        <p>The documentation will guide you through setting up and using the DAP Registry, as well as provide examples and API references.</p>
        <a href="https://github.com/TBD54566975/dap-registry-js" class="button">View Documentation</a>
    </div>
</body>
</html>
  `;
});