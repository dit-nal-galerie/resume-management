<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ResumeService
{
    public function getResumesWithUsers(int $userId): array
    {
        return DB::select(<<<SQL
        SELECT 
            r.resumeId,
            r.ref,
            r.position,
            hs.stateId,
            s.text AS stateText,
            r.link,
            r.comment,
            r.created,
            c1.companyId AS companyId,
            c1.name AS companyName,
            c1.city AS companyCity,
            c1.street AS companyStreet,
            c1.houseNumber AS companyHouseNumber,
            c1.postalCode AS companyPostalCode,
            c1.isRecruter AS companyIsRecruter,
            c1.ref AS companyRef,
            c2.companyId AS parentCompanyId,
            c2.name AS parentCompanyName,
            c2.city AS parentCompanyCity,
            c2.street AS parentCompanyStreet,
            c2.houseNumber AS parentCompanyHouseNumber,
            c2.postalCode AS parentCompanyPostalCode,
            c2.isRecruter AS parentCompanyIsRecruter,
            c2.ref AS parentCompanyRef,
            cc.contactId AS contactCompanyId,
            cc.name AS contactCompanyName,
            cp.contactId AS contactParentCompanyId,
            cp.name AS contactParentCompanyName
        FROM resumes r
        LEFT JOIN (
            SELECT h1.resumeId, h1.stateId
            FROM history h1
            INNER JOIN (
                SELECT resumeId, MAX(historyid) AS maxId
                FROM history
                GROUP BY resumeId
            ) h2 ON h1.resumeId = h2.resumeId AND h1.historyid = h2.maxId
        ) hs ON r.resumeId = hs.resumeId
        LEFT JOIN states s ON hs.stateId = s.stateId
        LEFT JOIN companies c1 ON r.companyId = c1.companyId
        LEFT JOIN companies c2 ON c1.parentCompanyId = c2.companyId
        LEFT JOIN contacts cc ON r.contactId = cc.contactId
        LEFT JOIN contacts cp ON r.parentContactId = cp.contactId
        WHERE r.userId = ?
        SQL, [$userId]);
    }
}