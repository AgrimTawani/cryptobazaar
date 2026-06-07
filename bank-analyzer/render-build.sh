#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install -r requirements.txt

# Download and extract Java JRE if not present
if [ ! -d "jdk" ]; then
    echo "Downloading Java JRE..."
    wget -qO jdk.tar.gz "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10%2B7/OpenJDK17U-jre_x64_linux_hotspot_17.0.10_7.tar.gz"
    mkdir jdk
    tar -xzf jdk.tar.gz -C jdk --strip-components=1
    rm jdk.tar.gz
fi

export PATH="${PWD}/jdk/bin:$PATH"
echo "Pre-building PDFBox font cache..."
python dummy.py

echo "Build complete."
