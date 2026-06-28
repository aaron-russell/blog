# DNS for AI Discovery (DNS-AID) Setup Guide

## Overview

DNS for AI Discovery (DNS-AID) is a standard (draft-mozleywilliams-dnsop-dnsaid) that enables DNS-based agent discovery through SVCB and HTTPS records. This allows AI agents to discover your services at the DNS level without HTTP requests.

## How DNS-AID Works

Instead of agents only discovering your capabilities through HTTP (`/.well-known/` endpoints), DNS-AID allows them to:
1. Query DNS for special records that point to agent capabilities
2. Discover endpoints and parameters at the DNS layer
3. Reduce initial HTTP overhead for discovery

## DNS-AID Record Types

There are several service prefixes you can configure:

### 1. `_index._agents.example.com` (Primary Index)
The main entry point for all agent services. This should point to your primary discovery endpoint.

**Example SVCB record:**
```
_index._agents.aaron-russell.co.uk SVCB 0 aaron-russell.co.uk (
  alpn="h2,http/1.1"
  mandatory="alpn"
)
```

### 2. `_a2a._agents.example.com` (Agent-to-Agent Communication)
For direct agent-to-agent communication and coordination.

**Example:**
```
_a2a._agents.aaron-russell.co.uk SVCB 1 aaron-russell.co.uk (
  alpn="h2"
  endpoints="/.well-known/a2a"
)
```

### 3. Service-Specific Records

You can also create specific records for different services:

```
_mcp._agents.aaron-russell.co.uk SVCB 1 aaron-russell.co.uk (
  alpn="h2,http/1.1"
  endpoints="/.well-known/mcp/server-card.json"
)

_api._agents.aaron-russell.co.uk SVCB 1 aaron-russell.co.uk (
  alpn="h2,http/1.1"
  endpoints="/.well-known/api-catalog"
)
```

## Implementation Steps

### 1. Access Your DNS Provider

Log in to your DNS provider (Cloudflare, Route 53, GoDaddy, etc.) where you manage `aaron-russell.co.uk`.

### 2. Add SVCB Records

Add the following SVCB records to your DNS zone:

#### Primary Index Record
```
Name: _index._agents.aaron-russell.co.uk
Type: SVCB (or HTTPS for compatibility)
Priority: 0
Target: aaron-russell.co.uk
Params:
  alpn=h2,http/1.1
  mandatory=alpn
```

#### MCP Record
```
Name: _mcp._agents.aaron-russell.co.uk
Type: SVCB
Priority: 1
Target: aaron-russell.co.uk
Params:
  alpn=h2,http/1.1
  endpoints=/.well-known/mcp/server-card.json
```

#### API Catalog Record
```
Name: _api._agents.aaron-russell.co.uk
Type: SVCB
Priority: 1
Target: aaron-russell.co.uk
Params:
  alpn=h2,http/1.1
  endpoints=/.well-known/api-catalog
```

### 3. DNSSEC Signing (Recommended)

For DNS queries to be secure and trusted by validating resolvers:

#### Enable DNSSEC
1. In your DNS provider, enable DNSSEC for your zone
2. Add DNSKEY records
3. Get your DS record from provider
4. Add DS record to parent zone (if applicable)

#### Example with Cloudflare:
1. Go to SSL/TLS > DNSSEC
2. Click "Enable DNSSEC"
3. Add the DS record to your registrar

### 4. Test Your Configuration

#### Using `dig` command:
```bash
# Check SVCB records
dig _index._agents.aaron-russell.co.uk SVCB +short

# Check with DNSSEC validation
dig _index._agents.aaron-russell.co.uk SVCB +dnssec +short

# Check MCP records
dig _mcp._agents.aaron-russell.co.uk SVCB +short
```

#### Using `nslookup`:
```bash
nslookup -type=SVCB _index._agents.aaron-russell.co.uk
```

#### Online tools:
- [MXToolbox SVCB Lookup](https://mxtoolbox.com/)
- [Google DNS Studio](https://dns.google/)
- [Cloudflare DNS Query](https://dns.cloudflare.com/)

## DNS Provider Instructions

### Cloudflare

1. Go to DNS Records
2. Click "Add record"
3. Set Record type to "CNAME" first (for target), or use Cloudflare's DNS API
4. For SVCB records, you may need to use Cloudflare's API:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records" \
  -H "X-Auth-Email: {email}" \
  -H "X-Auth-Key: {api_key}" \
  -H "Content-Type: application/json" \
  --data '{
    "type":"SVCB",
    "name":"_index._agents.aaron-russell.co.uk",
    "content":"0 aaron-russell.co.uk alpn=h2,http/1.1 mandatory=alpn",
    "ttl":3600
  }'
```

### Route 53 (AWS)

1. Go to Route 53 > Hosted Zones
2. Select your zone
3. Click "Create record"
4. Use Record type "HTTPS" or create via CLI:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id {zone_id} \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "_index._agents.aaron-russell.co.uk",
        "Type": "SVCB",
        "TTL": 3600,
        "ResourceRecords": [{
          "Value": "0 aaron-russell.co.uk alpn=h2,http/1.1 mandatory=alpn"
        }]
      }
    }]
  }'
```

### GoDaddy

1. Go to My Products > Domains
2. Select your domain
3. Click "Manage DNS"
4. Click "Add" to add a new record
5. Type: CNAME or Custom (for SVCB)
6. Name: `_index._agents`
7. Value: `aaron-russell.co.uk`

### Other Providers

Check your provider's documentation for:
- SVCB record support (or HTTPS records as fallback)
- DNS API endpoints
- DNSSEC enablement

## Advanced: SRV Records Alternative

If your DNS provider doesn't support SVCB, you can use SRV records as a fallback:

```
_agent._tcp.aaron-russell.co.uk SRV 0 0 443 aaron-russell.co.uk
_mcp._tcp.aaron-russell.co.uk SRV 0 0 443 aaron-russell.co.uk
```

## Verification Checklist

- [ ] Created `_index._agents._agents.aaron-russell.co.uk` SVCB record
- [ ] Created `_mcp._agents.aaron-russell.co.uk` SVCB record (optional)
- [ ] Created `_api._agents.aaron-russell.co.uk` SVCB record (optional)
- [ ] Records resolve via `dig` command
- [ ] DNSSEC enabled and validated
- [ ] TTL set appropriately (3600 or lower for testing)
- [ ] All records point to correct endpoints

## SVCB Parameters Reference

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `alpn` | Application Layer Protocol Negotiation | `alpn=h2,http/1.1` |
| `mandatory` | Required parameters | `mandatory=alpn` |
| `endpoints` | Service endpoints | `endpoints=/.well-known/api` |
| `no-default-alpn` | Disable default ALPN | `no-default-alpn` |
| `port` | Port override | `port=8443` |

## Troubleshooting

### Records not resolving
- Check TTL has expired (wait or reduce TTL)
- Verify DNS propagation at [DNS Checker](https://dnschecker.org/)
- Ensure zone is properly configured

### DNSSEC validation failing
- Regenerate DNSSEC keys
- Re-add DS record to parent zone
- Check chain of trust with `dig -trace`

### Agents not discovering records
- Verify record format is correct
- Check ALPN protocols are supported
- Ensure HTTP endpoints behind records are accessible
- Test with `dig` before expecting agent success

## References

- [DNS for AI Discovery (DNS-AID) RFC Draft](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)
- [RFC 9460 - HTTPS and SVCB Resource Records for DNS](https://www.rfc-editor.org/rfc/rfc9460)
- [RFC 2782 - SRV Records](https://www.rfc-editor.org/rfc/rfc2782)

## Integration with HTTP Discovery

DNS-AID complements your HTTP-based discovery:

1. **HTTP Discovery First** (Faster for most agents)
   - Link headers (`/.well-known/` endpoints)
   - Agent Skills index
   - API catalog

2. **DNS Discovery Second** (Fallback for DNS-capable agents)
   - DNS-AID SVCB records
   - Should point to same endpoints as HTTP

**Recommendation**: Implement DNS-AID as an enhancement, not replacement. Keep HTTP endpoints as primary discovery method.

## Next Steps

1. Choose your DNS provider approach
2. Create SVCB records in your DNS zone
3. Test with `dig` to verify
4. Enable DNSSEC for signed records
5. Document your DNS configuration
6. Monitor agent discovery via logs

---

**Note**: DNS-AID is still in draft status. Check the RFC for latest specifications before production use.
