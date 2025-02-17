"use server";
import { getUser } from "@workos-inc/authkit-nextjs";
import { WorkOS } from "@workos-inc/node";
import { AutoPaginatable, OrganizationMembership } from "@workos-inc/node"; // Ensure necessary types are imported
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserLock } from "@fortawesome/free-solid-svg-icons";

import createCompany from "../actions/workosActions";
import Link from "next/link";

export default async function NewListingPage() {
  const workos = new WorkOS(process.env.WORKOS_API_KEY);
  const { user } = await getUser();

  // If the user is not logged in, return a message
  if (!user) {
    return (
      <div className="container flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center p-4 rounded-lg bg-white shadow border border-red-500">
          <FontAwesomeIcon
            icon={faUserLock}
            className="text-red-500 text-3xl mb-2"
          />
          <h1 className="text-black text-xl font-semibold mb-2">
            Access Denied
          </h1>
          <p className="text-red-500 text-base">
            You need to be logged in to post
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Please login to access this feature.
          </p>
        </div>
      </div>
    );
  }
  // Initialize variable for organization memberships
  const organizationMemberships: AutoPaginatable<OrganizationMembership> | null =
    await workos.userManagement.listOrganizationMemberships({
      userId: user.id,
    });

  const activeOrganizationMemberships = organizationMemberships.data.filter(
    (om) => om.status === "active"
  );
  const oragnizationNames: { [key: string]: string } = {};

  for (const activeMemberships of activeOrganizationMemberships) {
    const organization = await workos.organizations.getOrganization(
      activeMemberships.organizationId
    );
    oragnizationNames[organization.id] = organization.name;
  }

  return (
    <div className="container mt-42">
      {/* {JSON.stringify(oragnizationNames)} */}
      <>
        <h2 className="text-lg mt-6">Your companies</h2>
        <p className="text-gray-500 text-sm mb-2">
          Select a company to create a job ad for{" "}
        </p>
        <div>
          <div className="border inline-block rounded-md">
            {Object.keys(oragnizationNames).map((orgId) => (
              <Link
                key={orgId}
                href={`/new-listing/${orgId}`} // Correct interpolation
                className={
                  "py-2 px-4 flex gap-2 items-center " +
                  (Object.keys(oragnizationNames)[0] === orgId
                    ? ""
                    : "border-t")
                }
              >
                {oragnizationNames[orgId]}
                <FontAwesomeIcon className="h-4" icon={faArrowRight} />
              </Link>
            ))}
          </div>
        </div>

        {organizationMemberships.data.length === 0 && (
          <div className="border border-red-200 bg-red-50 p-4 rounded-md">
            No companies found assigned to your user
          </div>
        )}

        <Link
          className="inline-flex gap-2 items-center bg-gray-200 px-4 py-2 rounded-md mt-6"
          href="/new-company"
        >
          Create new company
          <FontAwesomeIcon className="h-4" icon={faArrowRight} />
        </Link>
      </>
    </div>
  );
}
