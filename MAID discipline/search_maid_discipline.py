#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import time
import urllib.parse
import json
import os
import re
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("search_maid_discipline.log"),
        logging.StreamHandler()
    ]
)

REGULATORS = {
    "Ontario": {
        "domains": ["cpso.on.ca", "opsdt.ca", "doctors.cpso.on.ca", "register.cpso.on.ca"],
        "keywords": ["MAID", "medical assistance in dying"]
    },
    "British Columbia": {
        "domains": ["cpsbc.ca"],
        "keywords": ["MAID", "medical assistance in dying"]
    },
    "Alberta": {
        "domains": ["cpsa.ca"],
        "keywords": ["MAID", "medical assistance in dying"]
    },
    "Quebec": {
        "domains": ["cmq.org"],
        "keywords": ["aide médicale à mourir", "MAID", "medical assistance in dying"]
    },
    "Manitoba": {
        "domains": ["cpsm.mb.ca"],
        "keywords": ["MAID", "medical assistance in dying"]
    },
    "Saskatchewan": {
        "domains": ["cps.sk.ca"],
        "keywords": ["MAID", "medical assistance in dying"]
    },
    "Nova Scotia": {
        "domains": ["cpsns.ns.ca"],
        "keywords": ["MAID", "medical assistance in dying"]
    },
    "New Brunswick": {
        "domains": ["cpsnb.org"],
        "keywords": ["MAID", "medical assistance in dying", "aide médicale à mourir"]
    },
    "Newfoundland & Labrador": {
        "domains": ["cpsnl.ca"],
        "keywords": ["MAID", "medical assistance in dying"]
    },
    "Prince Edward Island": {
        "domains": ["cpspei.ca"],
        "keywords": ["MAID", "medical assistance in dying"]
    },
    "Yukon": {
        "domains": ["yukonmedicalcouncil.ca"],
        "keywords": ["MAID", "medical assistance in dying"]
    },
    "Nunavut": {
        "domains": ["nuphysicians.ca"],
        "keywords": ["MAID", "medical assistance in dying"]
    },
    "Northwest Territories": {
        "domains": ["hss.gov.nt.ca"],
        "keywords": ["MAID", "medical assistance in dying"]
    }
}

DISCIPLINE_KEYWORDS = [
    "discipline", "sanction", "reprimand", "suspend", "suspension", 
    "revoke", "revocation", "caution", "supervision", "censure", 
    "condition", "complaint", "conduct", "tribunal"
]

def search_yahoo(query, max_pages=3):
    """
    Search Yahoo for a query and extract decoded target URLs and titles.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    results = []
    
    for page in range(max_pages):
        start = page * 10 + 1
        url = f"https://search.yahoo.com/search?q={urllib.parse.quote(query)}&b={start}"
        logging.info(f"Querying Yahoo: {query} (page {page + 1})")
        
        try:
            r = requests.get(url, headers=headers, timeout=15)
            if r.status_code != 200:
                logging.warning(f"Yahoo Search returned status code {r.status_code}")
                break
                
            soup = BeautifulSoup(r.text, 'html.parser')
            
            # Find all search result items
            items_found = 0
            for a in soup.find_all('a', href=True):
                href = a['href']
                if 'r.search.yahoo.com' in href:
                    m = re.search(r'/RU=([^/]+)', href)
                    if m:
                        target_url = urllib.parse.unquote(m.group(1))
                        # Title element is usually within the same anchor or nearby h3
                        title = a.text.strip()
                        # Clean up title if it's just the URL or empty
                        if not title or title.startswith('http'):
                            # Try to find parent/sibling elements with text
                            parent_h3 = a.find_parent('h3')
                            if parent_h3:
                                title = parent_h3.text.strip()
                        
                        if target_url not in [res['url'] for res in results]:
                            results.append({
                                "title": title,
                                "url": target_url
                            })
                            items_found += 1
            
            logging.info(f"Extracted {items_found} URLs from page {page + 1}")
            if items_found == 0:
                # No more results or blocked
                break
                
            time.sleep(2)  # Respectful delay between pages
            
        except Exception as e:
            logging.error(f"Error during Yahoo Search page {page + 1}: {e}")
            break
            
    return results

def clean_html_text(html_content):
    """
    Remove scripts, styles, and other non-text HTML elements.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    for script in soup(["script", "style", "header", "footer", "nav"]):
        script.decompose()
    return soup.get_text(separator=' ')

def inspect_page(url):
    """
    Fetch and inspect target URL for MAID-related discipline content.
    Returns (is_match, match_reason, snippet)
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    # Skip binary/pdf files for direct scraping if needed, but print warning
    if url.lower().endswith('.pdf'):
        logging.info(f"Skipping PDF content inspection directly: {url} (will treat snippet from search engine if available)")
        return False, "PDF document (requires manual review)", ""
        
    try:
        logging.info(f"Inspecting URL: {url}")
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code != 200:
            return False, f"HTTP status {r.status_code}", ""
            
        text = clean_html_text(r.text)
        
        # Check for MAID keywords
        maid_matches = []
        for kw in ["maid", "medical assistance in dying", "assisted dying", "aide médicale à mourir"]:
            if re.search(r'\b' + re.escape(kw) + r'\b', text, re.IGNORECASE):
                maid_matches.append(kw)
                
        # Check for discipline keywords
        discipline_matches = []
        for kw in DISCIPLINE_KEYWORDS:
            if re.search(r'\b' + re.escape(kw) + r'\b', text, re.IGNORECASE):
                discipline_matches.append(kw)
                
        if maid_matches and discipline_matches:
            # Extract snippet around first MAID match
            snippet = ""
            first_match = maid_matches[0]
            match_idx = text.lower().find(first_match.lower())
            if match_idx != -1:
                start_idx = max(0, match_idx - 250)
                end_idx = min(len(text), match_idx + len(first_match) + 250)
                snippet = text[start_idx:end_idx].strip()
                # Clean up multiple whitespaces
                snippet = re.sub(r'\s+', ' ', snippet)
                snippet = f"... {snippet} ..."
                
            reason = f"MAID matches: {maid_matches}; Discipline matches: {discipline_matches}"
            return True, reason, snippet
            
        return False, "Keywords not matched", ""
        
    except Exception as e:
        logging.error(f"Error inspecting URL {url}: {e}")
        return False, f"Error: {e}", ""

def main():
    all_findings = []
    
    # Store unique URLs to avoid double inspecting
    inspected_urls = set()
    
    logging.info("Starting MAID physician discipline search across Canada...")
    
    for province, info in REGULATORS.items():
        logging.info(f"=== Searching for {province} ===")
        
        # Build search queries
        queries = []
        for domain in info["domains"]:
            for maid_kw in info["keywords"]:
                # Simple query format: "maid_kw" domain discipline
                # To find cases, search: "medical assistance in dying" cpso.on.ca discipline
                # This catches both direct pages and mentions.
                query = f'"{maid_kw}" {domain} discipline'
                queries.append(query)
                query_cond = f'"{maid_kw}" {domain} conditions'
                queries.append(query_cond)
                
        # Run searches
        province_results = []
        for query in queries:
            search_res = search_yahoo(query, max_pages=2)
            for res in search_res:
                url = res["url"]
                # Filter results: Only keep URLs that actually belong to/reference the domains of interest
                is_valid_domain = False
                for domain in info["domains"]:
                    if domain in url.lower():
                        is_valid_domain = True
                        break
                
                # Also accept Ontario Physicians & Surgeons Discipline Tribunal (opsdt.ca) or register.cpso.on.ca
                if is_valid_domain and url not in inspected_urls:
                    inspected_urls.add(url)
                    province_results.append(res)
            
            time.sleep(3)  # Delay between queries
            
        logging.info(f"Found {len(province_results)} unique candidate URLs for {province}")
        
        # Inspect candidates
        for res in province_results:
            url = res["url"]
            title = res["title"]
            
            is_match, reason, snippet = inspect_page(url)
            
            # If it's a PDF, we might not be able to fetch/inspect text easily,
            # but if it matches search query on CPSO or OPSDT, we still flag it for manual review
            if url.lower().endswith('.pdf') or is_match:
                finding = {
                    "province": province,
                    "url": url,
                    "title": title,
                    "is_pdf": url.lower().endswith('.pdf'),
                    "match_reason": reason,
                    "snippet": snippet if is_match else "PDF Document (Requires manual review)"
                }
                all_findings.append(finding)
                logging.info(f"[MATCH FOUND] {province}: {title} | {url}")
                
    # Save results to JSON
    output_json = "maid_discipline_results.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(all_findings, f, indent=2, ensure_ascii=False)
    logging.info(f"Saved structured JSON results to {output_json}")
    
    # Save results to Markdown Report
    output_md = "maid_discipline_report.md"
    with open(output_md, "w", encoding="utf-8") as f:
        f.write("# Canadian Physician Regulators: MAID-Related Discipline Report\n\n")
        f.write(f"**Report Generated on**: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("This report lists physicians, decisions, and licensing conditions discovered on the websites ")
        f.write("of Canadian medical regulatory authorities where the underlying issue relates to the provision ")
        f.write("of Medical Assistance in Dying (MAID).\n\n")
        
        if not all_findings:
            f.write("### No disciplinary records or licence conditions related to MAID were found.\n")
        else:
            # Group by province
            grouped = {}
            for finding in all_findings:
                prov = finding["province"]
                if prov not in grouped:
                    grouped[prov] = []
                grouped[prov].append(finding)
                
            for prov, items in grouped.items():
                f.write(f"## {prov}\n\n")
                for item in items:
                    f.write(f"### [{item['title']}]({item['url']})\n")
                    f.write(f"- **URL**: {item['url']}\n")
                    f.write(f"- **Document Type**: {'PDF Document' if item['is_pdf'] else 'Web Page'}\n")
                    if item['snippet']:
                        f.write(f"- **Excerpt / Reason**:\n  > {item['snippet']}\n")
                    f.write("\n")
                    
    logging.info(f"Saved Markdown report to {output_md}")
    print("\nSearch complete. View findings in 'maid_discipline_report.md'.")

if __name__ == "__main__":
    main()
