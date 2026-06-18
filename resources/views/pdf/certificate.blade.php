<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>وثيقة نسب — {{ $person->short_name_ar }}</title>
    <style>
        @page {
            margin: 0;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: sans-serif;
            color: #3D2B1F;
            margin: 0;
            padding: 0;
        }

        .frame {
            border: 8px double #8B6914;
            padding: 25px 30px;
            margin: 0;
            min-height: 260mm;
            background: #FBF8F0;
            position: relative;
        }

        .frame::before {
            content: "";
            position: absolute;
            top: 8px;
            right: 8px;
            bottom: 8px;
            left: 8px;
            border: 2px solid #C9A84C;
            pointer-events: none;
        }

        /* ═════════ رأس الوثيقة ═════════ */
        .header {
            text-align: center;
            padding-bottom: 18px;
            border-bottom: 3px solid #8B6914;
            margin-bottom: 25px;
        }

        .ornament {
            font-size: 24pt;
            color: #C9A84C;
            margin-bottom: 8px;
            letter-spacing: 8px;
        }

        .cert-title {
            font-size: 28pt;
            font-weight: bold;
            color: #8B6914;
            margin: 0;
            letter-spacing: 4px;
        }

        .tribe-name {
            font-size: 14pt;
            color: #6B4E3D;
            margin-top: 8px;
            font-weight: bold;
        }

        /* ═════════ جسم الوثيقة ═════════ */
        .intro {
            font-size: 13pt;
            text-align: center;
            color: #6B4E3D;
            margin: 25px 0 18px 0;
            line-height: 1.8;
        }

        .person-name {
            text-align: center;
            font-size: 32pt;
            font-weight: bold;
            color: #3D2B1F;
            margin: 20px 0 8px 0;
            padding: 15px;
            background: #F5EFE6;
            border: 2px dashed #C9A84C;
            border-radius: 6px;
        }

        .person-title {
            text-align: center;
            font-size: 13pt;
            color: #8B6914;
            margin-bottom: 25px;
        }

        /* ═════════ السلسلة ═════════ */
        .lineage-section {
            margin: 28px 0;
        }

        .lineage-label {
            font-size: 12pt;
            color: #6B4E3D;
            margin-bottom: 10px;
            text-align: center;
            font-weight: bold;
        }

        .lineage-text {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            color: #3D2B1F;
            line-height: 2.2;
            padding: 20px 15px;
            background: linear-gradient(to bottom, #FFFFFF, #F5EFE6);
            border: 1px solid #C9A84C;
            border-radius: 8px;
            word-spacing: 4pt;
        }

        .lineage-text .name,
        .lineage-text .connector {
            display: inline-block;
        }

        .lineage-text .connector {
            color: #C9A84C;
            font-size: 16pt;
            margin: 0 6pt;
        }

        /* ═════════ التواريخ ═════════ */
        .dates {
            margin: 20px 0;
            text-align: center;
            font-size: 11pt;
            color: #6B4E3D;
        }

        .dates span {
            display: inline-block;
            margin: 0 12px;
            padding: 6px 14px;
            background: #FFFFFF;
            border: 1px solid #C9A84C;
            border-radius: 20px;
        }

        /* ═════════ التذييل ═════════ */
        .footer {
            position: absolute;
            bottom: 30px;
            right: 30px;
            left: 30px;
            padding-top: 15px;
            border-top: 2px solid #8B6914;
            text-align: center;
            color: #6B4E3D;
            font-size: 10pt;
        }

        .seal {
            display: inline-block;
            width: 80px;
            height: 80px;
            border: 3px solid #8B6914;
            border-radius: 50%;
            text-align: center;
            line-height: 74px;
            font-size: 22pt;
            color: #8B6914;
            margin: 8px 0;
            background: #F5EFE6;
        }

        .issue-date {
            font-size: 9pt;
            color: #A08070;
            margin-top: 6px;
        }

        /* ═════════ زخارف ═════════ */
        .corner-top-right, .corner-top-left, .corner-bottom-right, .corner-bottom-left {
            position: absolute;
            font-size: 30pt;
            color: #C9A84C;
        }
        .corner-top-right    { top: 15px;    right: 20px; }
        .corner-top-left     { top: 15px;    left: 20px; }
        .corner-bottom-right { bottom: 15px; right: 20px; }
        .corner-bottom-left  { bottom: 15px; left: 20px; }
    </style>
</head>
<body>
    <div class="frame">
        <div class="corner-top-right">❖</div>
        <div class="corner-top-left">❖</div>

        <div class="header">
            <div class="ornament">﴾ ❁ ﴿</div>
            <h1 class="cert-title">وَثيقَةُ نَسَب</h1>
            <div class="tribe-name">قبيلة {{ $tribe->name_ar }}</div>
        </div>

        <div class="intro">
            نشهد بتوثيق نسب الشخص الكريم:
        </div>

        <div class="person-name">
            {{ $person->short_name_ar }}
        </div>

        @if ($person->title)
            <div class="person-title">{{ $person->title }}</div>
        @endif

        <div class="lineage-section">
            <div class="lineage-label">سلسلة النسب الشريف</div>
            <div class="lineage-text">
                @foreach ($chain as $i => $p)
                    @if ($i > 0)
                        @php $connector = $chain[$i - 1]->gender === 'female' ? 'بنت' : 'بن'; @endphp
                        <span class="connector">{{ $connector }}</span>
                    @endif
                    <span class="name">{{ $p->short_name_ar }}</span>
                @endforeach
            </div>
        </div>

        @if ($person->birth_year || $person->death_year)
            <div class="dates">
                @if ($person->birth_year)
                    <span>الميلاد: {{ $person->birth_year }}@if($person->birth_place) — {{ $person->birth_place }}@endif</span>
                @endif
                @if ($person->death_year)
                    <span>الوفاة: {{ $person->death_year }}@if($person->death_place) — {{ $person->death_place }}@endif</span>
                @endif
            </div>
        @endif

        <div class="corner-bottom-right">❖</div>
        <div class="corner-bottom-left">❖</div>

        <div class="footer">
            <div class="seal">⚜</div>
            <div><strong>ختم قبيلة {{ $tribe->name_ar }}</strong></div>
            <div class="issue-date">
                صدرت في: {{ $issueDate }}
            </div>
        </div>
    </div>
</body>
</html>
