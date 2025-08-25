# nexopost


nexopost is a simple application that allows sharing data between two devices. It is built using TypeScript and Node.js, providing a structured way to send and receive data over a network.

## Features

- Send data from one device to another.
- Receive data on a device.
- Simple RESTful API for data sharing.

## Project Structure

```
nexopost
├── src
│   ├── app.ts                # Entry point of the application
│   ├── controllers
│   │   └── dataController.ts # Handles data sharing logic
│   ├── routes
│   │   └── dataRoutes.ts     # Defines API routes
│   └── types
│       └── index.ts          # Type definitions for data structures
├── client
│   ├── index.html            # Web client interface
│   └── client.js             # Web client logic
├── package.json              # NPM configuration file
├── tsconfig.json             # TypeScript configuration file
├── .gitignore                # Git ignore file
└── README.md                 # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd nexopost
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run the following command:

```
npm start
```

The server will be running on `http://localhost:3000` by default.

## API Endpoints

- `POST /data/send` - Send data to another device.
- `GET /data/receive` - Receive data from another device.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.
