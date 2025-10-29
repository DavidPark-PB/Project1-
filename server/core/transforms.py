"""
Transform functions for data conversion and manipulation.
"""
import re
import json
import html
from typing import Any, List, Dict, Optional, Union
from html.parser import HTMLParser


class HTMLStripper(HTMLParser):
    """HTML tag stripper"""
    def __init__(self, allowed_tags=None):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = []
        self.allowed_tags = set(allowed_tags or [])

    def handle_data(self, d):
        self.text.append(d)

    def handle_starttag(self, tag, attrs):
        if tag in self.allowed_tags:
            self.text.append(f'<{tag}>')

    def handle_endtag(self, tag):
        if tag in self.allowed_tags:
            self.text.append(f'</{tag}>')

    def get_data(self):
        return ''.join(self.text)


def truncate(value: Any, max_length: int) -> str:
    """Truncate string to max length"""
    s = str(value)
    return s[:max_length] if len(s) > max_length else s


def currency_convert(value: float, to_currency: str, fx_rates: Dict[str, Dict[str, float]],
                     from_currency: str = "USD") -> float:
    """Convert currency using FX rates"""
    if from_currency == to_currency:
        return value

    # Convert to USD first if not already
    if from_currency != "USD":
        if from_currency not in fx_rates:
            raise ValueError(f"Unknown source currency: {from_currency}")
        value = value / fx_rates[from_currency].get("rate_to_USD", 1.0)

    # Convert from USD to target currency
    if to_currency != "USD":
        if to_currency not in fx_rates:
            raise ValueError(f"Unknown target currency: {to_currency}")
        value = value * fx_rates[to_currency].get("rate_from_USD", 1.0)

    return value


def round_number(value: float, decimals: int = 2) -> float:
    """Round number to specified decimals"""
    return round(float(value), decimals)


def sanitize_html(value: str, allowed_tags: List[str] = None) -> str:
    """Sanitize HTML, keeping only allowed tags"""
    if allowed_tags is None:
        allowed_tags = ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'ul', 'ol', 'li']

    stripper = HTMLStripper(allowed_tags)
    stripper.feed(str(value))
    return stripper.get_data()


def strip_disallowed_tags(value: str) -> str:
    """Strip all HTML tags"""
    return re.sub(r'<[^>]+>', '', str(value))


def limit_bytes(value: str, max_bytes: int) -> str:
    """Limit string to max bytes (UTF-8)"""
    encoded = str(value).encode('utf-8')
    if len(encoded) <= max_bytes:
        return value

    # Truncate and decode, handling incomplete characters
    truncated = encoded[:max_bytes]
    while truncated:
        try:
            return truncated.decode('utf-8')
        except UnicodeDecodeError:
            truncated = truncated[:-1]
    return ""


def slugify(value: str) -> str:
    """Convert string to URL-friendly slug"""
    value = str(value).lower()
    value = re.sub(r'[^\w\s-]', '', value)
    value = re.sub(r'[-\s]+', '-', value)
    return value.strip('-')


def limit_list(value: List[Any], max_items: int) -> List[Any]:
    """Limit list to max items"""
    if not isinstance(value, list):
        return []
    return value[:max_items]


def json_compact(value: Any) -> str:
    """Convert value to compact JSON string"""
    return json.dumps(value, separators=(',', ':'), ensure_ascii=False)


def tags_from_specifics(specifics: Dict[str, Any], keys: List[str] = None) -> str:
    """Extract tags from item specifics"""
    if not specifics:
        return ""

    if keys:
        values = [str(specifics.get(k, "")) for k in keys if k in specifics]
    else:
        values = [str(v) for v in specifics.values() if v]

    return ", ".join(values)


def kv_pairs(specifics: Dict[str, Any], separator: str = "; ") -> str:
    """Convert dict to key-value pairs string"""
    if not specifics:
        return ""

    pairs = [f"{k}:{v}" for k, v in specifics.items() if v]
    return separator.join(pairs)


def shopee_logistics_from_template(
    weight_g: float,
    dim_l: float,
    dim_w: float,
    dim_h: float,
    template: List[Dict[str, Any]],
    locale: str = "KR"
) -> Dict[str, Any]:
    """
    Match product dimensions to Shopee logistics template.
    Returns best matching logistics option.
    """
    if not template:
        return {
            "enabled": "Y",
            "size_id": 0,
            "weight": weight_g,
            "dimension_l": dim_l,
            "dimension_w": dim_w,
            "dimension_h": dim_h
        }

    # Filter by locale if available
    locale_templates = [t for t in template if t.get("locale") == locale]
    if not locale_templates:
        locale_templates = template

    # Find best match based on dimensions and weight
    best_match = None
    for tmpl in locale_templates:
        max_weight = tmpl.get("max_weight_g", float('inf'))
        max_dim = tmpl.get("max_dimension_cm", float('inf'))

        if weight_g <= max_weight and max(dim_l, dim_w, dim_h) <= max_dim:
            best_match = tmpl
            break

    if best_match:
        return {
            "enabled": "Y",
            "size_id": best_match.get("size_id", 0),
            "weight": weight_g,
            "dimension_l": dim_l,
            "dimension_w": dim_w,
            "dimension_h": dim_h
        }

    # No match found, return default
    return {
        "enabled": "Y",
        "size_id": 0,
        "weight": weight_g,
        "dimension_l": dim_l,
        "dimension_w": dim_w,
        "dimension_h": dim_h
    }


def shopee_variations(variants: List[Dict[str, Any]], master_price: float) -> List[Dict[str, Any]]:
    """
    Convert variants to Shopee format.
    """
    if not variants:
        return []

    result = []
    for var in variants:
        variation = {
            "tier_index": [0] if var.get("opt_value1") else [],
            "stock": var.get("qty", 0),
            "price": var.get("price", master_price),
            "variation_sku": var.get("variant_sku", var.get("base_sku"))
        }

        if var.get("opt_value2"):
            variation["tier_index"].append(1)

        result.append(variation)

    return result


def price_delta_from_master(variant_price: float, master_price: float, as_percentage: bool = False) -> float:
    """Calculate price delta from master price"""
    delta = variant_price - master_price

    if as_percentage and master_price > 0:
        return (delta / master_price) * 100

    return delta


def expand_variant_values(variants: List[Dict[str, Any]], attribute: str) -> List[str]:
    """
    Extract unique values for a specific variant attribute.
    Useful for creating variant option lists.
    """
    values = set()

    for var in variants:
        if attribute in var and var[attribute]:
            values.add(str(var[attribute]))

    return sorted(list(values))


def apply_transform(value: Any, transform_name: str, params: Dict[str, Any], context: Dict[str, Any] = None) -> Any:
    """
    Apply a named transform with parameters.

    Args:
        value: The value to transform
        transform_name: Name of the transform function
        params: Parameters for the transform
        context: Additional context (fx_rates, templates, etc.)

    Returns:
        Transformed value
    """
    context = context or {}

    transform_map = {
        'truncate': lambda v, p: truncate(v, p.get('max', 255)),
        'currency_convert': lambda v, p: currency_convert(
            float(v),
            p.get('to', 'USD'),
            context.get('fx_rates', {}),
            p.get('from', context.get('default_currency', 'USD'))
        ),
        'round': lambda v, p: round_number(float(v), p.get('decimals', 2)),
        'sanitize_html': lambda v, p: sanitize_html(v, p.get('allowed_tags')),
        'strip_disallowed_tags': lambda v, p: strip_disallowed_tags(v),
        'limit_bytes': lambda v, p: limit_bytes(v, p.get('max', 50000)),
        'slugify': lambda v, p: slugify(v),
        'limit_list': lambda v, p: limit_list(v, p.get('max', 10)),
        'json_compact': lambda v, p: json_compact(v),
        'tags_from_specifics': lambda v, p: tags_from_specifics(v, p.get('keys')),
        'kv_pairs': lambda v, p: kv_pairs(v, p.get('separator', '; ')),
    }

    if transform_name not in transform_map:
        raise ValueError(f"Unknown transform: {transform_name}")

    try:
        return transform_map[transform_name](value, params)
    except Exception as e:
        raise ValueError(f"Transform {transform_name} failed: {str(e)}")


def apply_transforms(value: Any, transforms: List[Dict[str, Any]], context: Dict[str, Any] = None) -> Any:
    """
    Apply a chain of transforms to a value.

    Args:
        value: Initial value
        transforms: List of transform specifications
        context: Additional context for transforms

    Returns:
        Final transformed value
    """
    result = value

    for transform in transforms:
        if isinstance(transform, dict):
            # Transform specified as {name: params}
            for name, params in transform.items():
                if params is None:
                    params = {}
                result = apply_transform(result, name, params, context)
        elif isinstance(transform, str):
            # Transform specified as just a name
            result = apply_transform(result, transform, {}, context)

    return result
