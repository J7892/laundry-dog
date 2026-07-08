#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import time
import urllib.parse
import json
import os
import re
import logging
import io
import pypdf

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

MAID_KEYWORDS = ["maid", "medical assistance in dying", "assisted dying", "aide médicale à mourir"]

DISCIPLINE_KEYWORDS = [
    "discipline", "sanction", "reprimand", "suspend", "suspension", 
    "revoke", "revocation", "caution", "supervision", "censure", 
    "condition", "complaint", "conduct", "tribunal"
]

def search_yahoo(query, max_pages=3):
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
            
            items_found = 0
            for a in soup.find_all('a', href=True):
                href = a['href']
                if 'r.search.yahoo.com' in href:
                    m = re.search(r'/RU=([^/]+)', href)
                    if m:
                        target_url = urllib.parse.unquote(m.group(1))
                        title = a.text.strip()
                        if not title or title.startswith('http'):
                            parent_h3 = a.find_parent('h3')
                            if parent_h3:
                                title = parent_h3.text.strip()
                        
                        # Find snippet if available
                        snippet = ""
                        parent_div = a.find_parent('div')
                        if parent_div:
                            sibling_snippet = parent_div.find_next_sibling('div', class_='compText') or parent_div.find_next_sibling('div')
                            if sibling_snippet:
                                snippet = sibling_snippet.text.strip()
                        
                        if target_url not in [res['url'] for res in results]:
                            results.append({
                                "title": title,
                                "url": target_url,
                                "search_snippet": snippet
                            })
                            items_found += 1
            
            logging.info(f"Extracted {items_found} URLs from page {page + 1}")
            if items_found == 0:
                break
                
            time.sleep(2)
            
        except Exception as e:
            logging.error(f"Error during Yahoo Search page {page + 1}: {e}")
            break
            
    return results

def clean_html_text(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    for script in soup(["script", "style", "header", "footer", "nav", "aside"]):
        script.decompose()
    return soup.get_text(separator=' ')

def inspect_pdf(pdf_bytes):
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = pypdf.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        return text
    except Exception as e:
        logging.error(f"Error parsing PDF: {e}")
        return ""

def check_proximity_match(text, keywords_a, keywords_b, max_distance=300):
    text_lower = text.lower()
    # Normalize whitespace
    text_lower = re.sub(r'\s+', ' ', text_lower)
    
    for kw_a in keywords_a:
        pattern_a = r'\b' + re.escape(kw_a.lower()) + r'\b'
        for m_a in re.finditer(pattern_a, text_lower):
            start_a = m_a.start()
            end_a = m_a.end()
            
            for kw_b in keywords_b:
                pattern_b = r'\b' + re.escape(kw_b.lower()) + r'\b'
                for m_b in re.finditer(pattern_b, text_lower):
                    start_b = m_b.start()
                    end_b = m_b.end()
                    
                    dist = min(abs(start_a - end_b), abs(start_b - end_a))
                    if dist <= max_distance:
                        # Extract snippet from original text around this match
                        snippet_start = max(0, min(start_a, start_b) - 150)
                        snippet_end = min(len(text), max(end_a, end_b) + 150)
                        snippet = text[snippet_start:snippet_end].strip()
                        snippet = re.sub(r'\s+', ' ', snippet)
                        return True, f"Matched '{kw_a}' and '{kw_b}' within {dist} chars", f"... {snippet} ..."
    return False, "", ""

def inspect_page(url, search_snippet=""):
    """
    Fetch and inspect target URL for MAID-related discipline content using proximity matching.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://search.yahoo.com/"
    }
    
    try:
        logging.info(f"Inspecting URL: {url}")
        r = requests.get(url, headers=headers, timeout=15)
        
        # Check if we got blocked or failed
        if r.status_code != 200:
            # Try to fall back to the search snippet if we can
            logging.warning(f"HTTP status {r.status_code} for {url}. Falling back to search snippet.")
            if search_snippet:
                is_match, reason, snippet = check_proximity_match(search_snippet, MAID_KEYWORDS, DISCIPLINE_KEYWORDS)
                if is_match:
                    return True, f"Search snippet matched (HTTP {r.status_code}): {reason}", snippet
            return False, f"HTTP status {r.status_code} (No matching snippet)", ""
            
        content_type = r.headers.get('Content-Type', '').lower()
        
        # Determine if PDF
        if url.lower().endswith('.pdf') or 'application/pdf' in content_type or r.content.startswith(b'%PDF'):
            text = inspect_pdf(r.content)
        else:
            text = clean_html_text(r.text)
            
        if not text:
            # Fall back to search snippet if no text could be extracted
            if search_snippet:
                is_match, reason, snippet = check_proximity_match(search_snippet, MAID_KEYWORDS, DISCIPLINE_KEYWORDS)
                if is_match:
                    return True, f"Search snippet matched (Empty page body): {reason}", snippet
            return False, "Could not extract text from document", ""
            
        # Run proximity match check
        is_match, reason, snippet = check_proximity_match(text, MAID_KEYWORDS, DISCIPLINE_KEYWORDS)
        if is_match:
            return True, reason, snippet
            
        # Final fallback: check search snippet even if the full text didn't trigger a proximity match
        if search_snippet:
            is_match, reason, snippet = check_proximity_match(search_snippet, MAID_KEYWORDS, DISCIPLINE_KEYWORDS)
            if is_match:
                return True, f"Search snippet matched (Page body did not match): {reason}", snippet
                
        return False, "Keywords not matched in proximity", ""
        
    except Exception as e:
        logging.error(f"Error inspecting URL {url}: {e}")
        # Try to fall back to the search snippet
        if search_snippet:
            is_match, reason, snippet = check_proximity_match(search_snippet, MAID_KEYWORDS, DISCIPLINE_KEYWORDS)
            if is_match:
                return True, f"Search snippet matched (Error during fetch): {reason}", snippet
        return False, f"Error: {e}", ""

def main():
    all_findings = []
    inspected_urls = set()
    
    logging.info("Starting MAID physician discipline search across Canada (Proximity Edition)...")
    
    for province, info in REGULATORS.items():
        logging.info(f"=== Searching for {province} ===")
        
        queries = []
        for domain in info["domains"]:
            for maid_kw in info["keywords"]:
                query = f'"{maid_kw}" {domain} discipline'
                queries.append(query)
                query_cond = f'"{maid_kw}" {domain} conditions'
                queries.append(query_cond)
                
        province_results = []
        for query in queries:
            search_res = search_yahoo(query, max_pages=2)
            for res in search_res:
                url = res["url"]
                is_valid_domain = False
                for domain in info["domains"]:
                    if domain in url.lower():
                        is_valid_domain = True
                        break
                
                if is_valid_domain and url not in inspected_urls:
                    inspected_urls.add(url)
                    province_results.append(res)
            
            time.sleep(3)
            
        logging.info(f"Found {len(province_results)} unique candidate URLs for {province}")
        
        for res in province_results:
            url = res["url"]
            title = res["title"]
            search_snippet = res.get("search_snippet", "")
            
            is_match, reason, snippet = inspect_page(url, search_snippet)
            
            if is_match:
                finding = {
                    "province": province,
                    "url": url,
                    "title": title,
                    "is_pdf": url.lower().endswith('.pdf') or '.pdf' in reason.lower() or 'alertdocument' in url.lower(),
                    "match_reason": reason,
                    "snippet": snippet
                }
                all_findings.append(finding)
                logging.info(f"[MATCH FOUND] {province}: {title} | {url}")
                
    output_json = "maid_discipline_results.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(all_findings, f, indent=2, ensure_ascii=False)
    logging.info(f"Saved structured JSON results to {output_json}")
    
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
