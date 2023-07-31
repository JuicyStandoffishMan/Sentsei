import regex

def find_and_fill_kanji_without_furigana(file_path):
    kanji_pattern = regex.compile(r'(\p{Script=Han}+)(?:\((.*?)\))?')
    kanji_to_furigana = dict()
    bad_entries = []
    filled_entries = []

    with open(file_path, "r", encoding="utf8") as file:
        lines = file.readlines()

    # First pass to collect all kanji to furigana mappings
    for line in lines:
        kanji_matches = kanji_pattern.findall(line)
        for kanji, furigana in kanji_matches:
            if furigana:
                kanji_to_furigana[kanji] = furigana

    # Second pass to fill in missing furigana
    for line_num, line in enumerate(lines, 1):
        def repl(match):
            kanji = match.group(1)
            furigana = match.group(2)
            if furigana:
                return match.group(0)  # Return the original text if there's already furigana
            elif kanji in kanji_to_furigana:
                filled_entries.append((line_num, kanji, kanji_to_furigana[kanji]))
                return f"{kanji}({kanji_to_furigana[kanji]})"  # Add furigana if it's missing
            else:
                # Only append to bad entries if the kanji appears before " - "
                if " - " in line and kanji in line.split(" - ")[0]:
                    bad_entries.append((line_num, kanji))
                return kanji  # Keep the original kanji if there's no furigana

        line = kanji_pattern.sub(repl, line)
        lines[line_num - 1] = line

    
    with open(file_path, "w", encoding="utf8") as file:
        file.writelines(lines)
    
    return bad_entries, filled_entries

def main():
    file_path = "lesson.txt"
    bad_entries, filled_entries = find_and_fill_kanji_without_furigana(file_path)

    if not bad_entries:
        print("No kanji without furigana found.")
    else:
        print("Found kanji without furigana:")
        for line_num, entry in bad_entries:
            print(f"Line {line_num}: {entry}")

    if filled_entries:
        print("\nFilled kanji with furigana:")
        for line_num, kanji, furigana in filled_entries:
            print(f"Line {line_num}: {kanji}({furigana})")

if __name__ == "__main__":
    main()
