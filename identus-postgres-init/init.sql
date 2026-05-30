-- Create the four databases Identus needs
CREATE DATABASE pollux;
CREATE DATABASE connect;
CREATE DATABASE agent;
CREATE DATABASE node_db;

-- Create application roles Identus migrations reference
CREATE ROLE "pollux-application-user";
CREATE ROLE "connect-application-user";
CREATE ROLE "agent-application-user";

-- Grant ownership to the superuser so migrations work
GRANT ALL PRIVILEGES ON DATABASE pollux TO identus;
GRANT ALL PRIVILEGES ON DATABASE connect TO identus;
GRANT ALL PRIVILEGES ON DATABASE agent TO identus;
GRANT ALL PRIVILEGES ON DATABASE node_db TO identus;

GRANT "pollux-application-user" TO identus;
GRANT "connect-application-user" TO identus;
GRANT "agent-application-user" TO identus;
