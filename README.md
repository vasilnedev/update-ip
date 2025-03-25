# update-ip
Automatically monitor changes in public IP addresses to seamlessly update DNS records, ensuring continuous connectivity.

This service periodically queries public IP echo servers to check its public IP address. If the address changes, it makes API calls to update DNS records accordingly.

Prerequisites:
* A running public IP echo server(s)
* API access to a dynamic DNS server(s)

The service runs as a Docker container. The setup.sh script assists in setting up the service, providing a sample configuration file for using the Dynu DNS API.
